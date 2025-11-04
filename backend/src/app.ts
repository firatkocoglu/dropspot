import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { prisma} from "./config/prisma";

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/healthz', (_req, res) => {
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

export default app;