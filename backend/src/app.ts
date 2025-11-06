import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import {prisma} from "./config/prisma";
import {errorHandler} from "@/middlewares/errorHandler";
import {authRouter} from "@/routes/auth.routes";
import {dropRouter} from "@/routes/drop.routes";
import {waitlistRouter} from "@/routes/waitlist.routes";
import {claimRouter} from "@/routes/claim.routes";

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// Routes
app.use('/auth', authRouter);
// Drop CRUD
app.use('/drops', dropRouter);
// Waitlist endpoints share same prefix as drops
app.use('/drops', waitlistRouter)
// Claim endpoints
app.use('/drops', claimRouter)

app.get('/health', (_req, res) => {
    res.json({ ok: true });
});

app.get('/health/db',async(_req, res) => {
   try {
       await prisma.$queryRaw`SELECT 1`;
        res.json({ db : 'running' });
   } catch(e) {
       res.status(500).json({ db : 'down' });
   }
});

app.use(errorHandler)

export default app;