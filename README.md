# DropSpot — Full-Stack Case

**Project Start Time: 2025-11-04 18:00**

Full-stack case project for Alpaco — limited-stock and waitlist platform built with Express, Prisma, PostgreSQL, and Next.js.

**⚙️ Backend Setup**
If you want to recreate the backend setup from scratch:  
```
# 1. Initialize a new Node.js project
mkdir backend && cd backend
npm init -y

# 2. Install core dependencies
npm install express
npm install dotenv cors helmet

# 3. Add TypeScript and types
npm install -D typescript ts-node-dev @types/node @types/express

# 4. Initialize TypeScript config
npx tsc --init

# 5. Add Prisma ORM
npm install prisma @prisma/client
npx prisma init

# 6. Create project structure
mkdir src src/config src/controllers src/services src/middlewares src/routes src/utils
touch src/app.ts src/server.ts
```



**📦 Data Model & Rationale**

**🐳 Local Development Environment**

The project runs PostgreSQL 17 in a Docker container for consistency across environments.
A minimal docker-compose.yml file provisions the database service with mounted volumes for persistent data:
```
services:
  postgres:
    image: postgres:17
    container_name: dropspot-db
    environment:
      POSTGRES_USER: dropspot_user
      POSTGRES_PASSWORD: dropspot_pass
      POSTGRES_DB: dropspot_db
    ports:
      - "5432:5432"
    volumes:
      - ./pgdata:/var/lib/postgresql/data
```
This setup allows easy database resets and ensures the same PostgreSQL version is used in all local and CI environments.
You can start the DB with:
```
docker compose up -d
```

We model the drop flow with four core entities, plus Session for refresh-token auth:
•	User — minimal auth footprint (email unique, passwordHash, role).  
•	Drop — a limited-slots campaign with a claim window (claimWindowStart/End, totalSlots, isActive).  
•	Waitlist — a user’s intent to join a given drop (userId,dropId,priorityScore,joinedAt).  
•	Claim — a granted, single-use code for a user and a drop (code unique, status, issuedAt, usedAt?).  
•	Session — stateful refresh-token store (hashed), with revoke/expiry fields.  

All timestamps are stored as UTC (timestamptz) for portability; UI is responsible for localization.  

```
User 1——*   Waitlist  *——1 Drop
User 1——*   Claim     *——1 Drop
User 1——*   Session
```
	•Waitlist: unique (userId,dropId) → a user joins a drop at most once.
	•Claim: unique (userId,dropId) and code unique → one claim per user per drop; code is globally unique.
	•Cascades: deleting a User/Drop cascades to dependent rows (MVP-friendly).

**Indexing Strategies**  
•Drop: isActive, (claimWindowStart, claimWindowEnd), createdAt.  
•Waitlist: userId, (dropId, priorityScore DESC, joinedAt ASC) → deterministic ordering.  
•Claim: userId, dropId, status, issuedAt.  
•Session: userId, expiresAt, (userId, revokedAt) → fast active-session lookups.

**Why no remainingSlots column?**  
To keep the schema simple and correct, remaining capacity is derived at read/claim time:

```
remaining = totalSlots − COUNT(Claim WHERE dropId = X AND status IN (ISSUED, USED))
```
This avoids denormalization bugs though I can still add denormalized remaining field into drops table in case the remaining calculation that we implemented bottlenecks in high traffic and load.
But for the sake of simplicity in limited time (72 hours), I choose to implement simple remaining calculation.
