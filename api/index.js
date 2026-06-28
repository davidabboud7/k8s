import express from "express";
import pg from "pg";
import { createClient } from "redis";
import { randomUUID } from "crypto";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

const pool = new pg.Pool({
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    database: process.env.PG_DATABASE,
    port: 5432,
});

const redisClient = createClient({
    url: `redis://${process.env.REDIS_HOST}:6379`,
    socket: {
        reconnectStrategy: (retries) => Math.min(retries * 100, 3000), // retry with backoff, cap at 3s
    },
});
let redisReady = false;

redisClient.on("error", (err) => console.error("Redis client error:", err.message));
redisClient.on("ready", () => { redisReady = true; });
redisClient.on("end", () => { redisReady = false; });

redisClient.connect().catch((err) => console.error("Initial redis connect failed:", err.message));

// Readiness probe: are dependencies reachable?
app.get("/ready", async (req, res) => {
    try {
        await pool.query("SELECT 1");
        if (!redisReady) throw new Error("redis not ready");
        res.status(200).send("ready");
    } catch (err) {
        res.status(503).send("not ready: " + err.message);
    }
});

// Liveness probe: is the process itself alive?
app.get("/health", (req, res) => res.status(200).send("ok"));

app.get("/", async (req, res) => {
    const dbTime = await pool.query("SELECT NOW()");
    const visits = await redisClient.incr("visits");
    res.json({
        message: "API is alive",
        db_time: dbTime.rows[0].now,
        visit_count: visits,
    });
});

// POST /jobs { url: "https://example.com" }
app.post("/jobs", async (req, res) => {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "url required" });

    const jobId = randomUUID();
    const job = JSON.stringify({ id: jobId, url, status: "queued" });

    await redisClient.set(`job:${jobId}`, job);
    await redisClient.rPush("job_queue", jobId);

    res.status(202).json({ id: jobId, status: "queued" });
});

// GET /jobs/:id
app.get("/jobs/:id", async (req, res) => {
    const job = await redisClient.get(`job:${req.params.id}`);
    if (!job) return res.status(404).json({ error: "not found" });
    res.json(JSON.parse(job));
});

app.listen(PORT, () => console.log(`API listening on ${PORT}`));