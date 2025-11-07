import request from "supertest";
import app from "@/app";
import {prisma} from "@/config/prisma";

async function resetDb() {
  await prisma.$executeRawUnsafe(`
    TRUNCATE TABLE "Claim","Waitlist","Drop","User","Session" RESTART IDENTITY CASCADE;
  `);
}

async function signupAndLogin(email: string) {
  const password = "Passw0rd!";
  await request(app).post("/auth/signup").send({ email, password });
  const res = await request(app).post("/auth/login").send({ email, password });
  const token = res.body?.accessToken;
  if (!token) throw new Error("Login response did not include accessToken");
  return token;
}

async function createFutureDrop(totalSlots = 1) {
  const now = new Date();
  return prisma.drop.create({
    data: {
      title: "Integration Test Drop",
      isActive: true,
      totalSlots,
      claimWindowStart: new Date(now.getTime() + 5 * 60 * 1000),
      claimWindowEnd: new Date(now.getTime() + 35 * 60 * 1000),
    },
  });
}

async function openClaimWindow(dropId: string) {
  const now = new Date();
  await prisma.drop.update({
    where: { id: dropId },
    data: {
      claimWindowStart: new Date(now.getTime() - 1 * 60 * 1000),
    },
  });
}

async function joinWaitlist(dropId: string, token: string) {
  await request(app)
    .post(`/drops/${dropId}/join`)
    .set("Authorization", `Bearer ${token}`)
    .send()
    .expect(200);
}

async function closeClaimWindow(dropId: string) {
  const now = new Date();
  await prisma.drop.update({
    where: { id: dropId },
    data: {
      claimWindowEnd: new Date(now.getTime() - 1 * 60 * 1000),
    },
  });
}

describe("POST /drops/:id/claim — claim window behavior", () => {
  beforeEach(async () => {
    await resetDb();
  });

  it("allows waitlist join before window; claim before start is blocked", async () => {
    // 1) Create a future drop (claim window in the future)
    const drop = await createFutureDrop(1);

    // 2) Signup and login to get access token
    const token = await signupAndLogin("it@test.com");

    // 3) Join waitlist (should succeed)
    await joinWaitlist(drop.id, token);

    // 4) Attempt to claim immediately (should fail with 409 and CLAIM_WINDOW_CLOSED)
    const res = await request(app)
      .post(`/drops/${drop.id}/claim`)
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(res.status).toBe(409);
    expect(res.body?.name).toBe("CLAIM_WINDOW_CLOSED");
  });

  it("join before window, then window opens → successful claim", async () => {
    // 1) Create a future drop (claim window in the future)
    const drop = await createFutureDrop(1);

    // 2) Signup and login to get access token
    const token = await signupAndLogin("it@test.com");

    // 3) Join waitlist
    await joinWaitlist(drop.id, token);

    // 4) Open claim window (move start time into the past)
    await openClaimWindow(drop.id);

    // 5) Claim (should succeed with 200 and code starting with CLAIM-)
    const res = await request(app)
      .post(`/drops/${drop.id}/claim`)
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(res.status).toBe(200);
    expect(typeof res.body?.code).toBe("string");
    expect(res.body.code).toMatch(/^CLAIM-/);
    expect(res.body?.usedAt).toBeTruthy();
  });

  it("window opens but user not in waitlist → NOT_IN_WAITLIST", async () => {
    const drop = await createFutureDrop(1);
    const token = await signupAndLogin("niw@test.com");

    await openClaimWindow(drop.id);

    const res = await request(app)
      .post(`/drops/${drop.id}/claim`)
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(res.status).toBe(409);
    expect(res.body?.name).toBe("NOT_IN_WAITLIST");
  });

  it("join before window; after window end claim is blocked with CLAIM_WINDOW_CLOSED", async () => {
    const drop = await createFutureDrop(1);
    const token = await signupAndLogin("cw@test.com");
    await joinWaitlist(drop.id, token);

    // Move end to the past (window closed)
    await closeClaimWindow(drop.id);

    const res = await request(app)
      .post(`/drops/${drop.id}/claim`)
      .set("Authorization", `Bearer ${token}`)
      .send();

    expect(res.status).toBe(409);
    expect(res.body?.name).toBe("CLAIM_WINDOW_CLOSED");
  });
});
