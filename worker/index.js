import { createClient } from "redis";
import { setTimeout as sleep } from "timers/promises";

const redisClient = createClient({ url: `redis://${process.env.REDIS_HOST}:6379` });
await redisClient.connect();

const WORKER_ID = process.env.HOSTNAME || "worker-unknown";
console.log(`[${WORKER_ID}] worker started, waiting for jobs...`);

while (true) {
    // BLPOP blocks until a job is available — no polling loop needed
    const result = await redisClient.blPop("job_queue", 0);
    const jobId = result.element;

    const jobRaw = await redisClient.get(`job:${jobId}`);
    if (!jobRaw) continue;
    const job = JSON.parse(jobRaw);

    console.log(`[${WORKER_ID}] picked up job ${jobId} for ${job.url}`);

    if (job.url === "stress") {
        const end = Date.now() + 8000; // burn CPU for 8 seconds
        while (Date.now() < end) {
            Math.sqrt(Math.random()); // busy loop
        }
        job.status = "done";
        job.title = "stress test complete";
        job.worker = WORKER_ID;
        await redisClient.set(`job:${jobId}`, JSON.stringify(job));
        console.log(`[${WORKER_ID}] finished stress job ${jobId}`);
        continue;
    }

    try {
        const response = await fetch(job.url, { signal: AbortSignal.timeout(5000) });
        const html = await response.text();
        const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
        const title = titleMatch ? titleMatch[1].trim() : "(no title found)";

        job.status = "done";
        job.title = title;
        job.worker = WORKER_ID;
    } catch (err) {
        job.status = "failed";
        job.error = err.message;
        job.worker = WORKER_ID;
    }

    await redisClient.set(`job:${jobId}`, JSON.stringify(job));
    console.log(`[${WORKER_ID}] finished job ${jobId}: ${job.status}`);
}