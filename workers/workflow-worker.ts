import "dotenv/config";
import { Job, Worker } from "bullmq";
import { getRedisConnection } from "../lib/redis";
import {
  WorkflowExecutionJob,
} from "../lib/workflow-queue";
import { runWorkflowExecution } from "../lib/workflow-runner";

const worker = new Worker<WorkflowExecutionJob>(
  "workflow-executions",
  async (job: Job<WorkflowExecutionJob>) => {
    console.log(`Processing execution ${job.data.executionId}`);

    const result = await runWorkflowExecution(job.data.executionId);

    console.log(`Finished execution ${job.data.executionId}`);

    return {
      executionId: result.id,
      status: result.status,
    };
  },
  {
    connection: getRedisConnection(),
    concurrency: 5,
  }
);

worker.on("completed", (job) => {
  console.log(`Job completed: ${job.id}`);
});

worker.on("failed", (job, error) => {
  console.error(`Job failed: ${job?.id}`, error);
});

process.on("SIGTERM", async () => {
  await worker.close();
  process.exit(0);
});

process.on("SIGINT", async () => {
  await worker.close();
  process.exit(0);
});

console.log("Workflow worker started.");
