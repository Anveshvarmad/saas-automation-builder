import { Queue } from "bullmq";
import { getRedisConnection } from "./redis";

export type WorkflowExecutionJob = {
  executionId: string;
};

let workflowQueue: Queue<WorkflowExecutionJob> | null = null;

export function getWorkflowQueue() {
  if (!workflowQueue) {
    workflowQueue = new Queue<WorkflowExecutionJob>("workflow-executions", {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 1000,
      },
    });
  }

  return workflowQueue;
}

export async function enqueueWorkflowExecution(executionId: string) {
  const queue = getWorkflowQueue();

  return queue.add(
    "run-workflow",
    {
      executionId,
    },
    {
      jobId: `${executionId}-${Date.now()}`,
    }
  );
}
