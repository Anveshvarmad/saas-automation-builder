import { prisma } from "./prisma";
import { runOpenAITextAction } from "./openai-action";
import type { Prisma } from "../generated/prisma/client";

type MutableJsonObject = Record<string, Prisma.InputJsonValue>;

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  if (value === null || value === undefined) {
    return "";
  }

  if (
    typeof value === "string" ||
    typeof value === "number" ||
    typeof value === "boolean"
  ) {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((item) => toJsonValue(item));
  }

  if (typeof value === "object") {
    const output: MutableJsonObject = {};

    for (const [key, item] of Object.entries(value as Record<string, unknown>)) {
      if (item !== undefined) {
        output[key] = toJsonValue(item);
      }
    }

    return output;
  }

  return String(value);
}

function toJsonObject(value: unknown): MutableJsonObject {
  const jsonValue = toJsonValue(value);

  if (jsonValue && typeof jsonValue === "object" && !Array.isArray(jsonValue)) {
    return jsonValue as MutableJsonObject;
  }

  return {};
}

async function runStep(
  stepType: string,
  config: unknown,
  inputData: unknown
): Promise<MutableJsonObject> {
  const safeConfig = toJsonObject(config);
  const safeInput = toJsonObject(inputData);

  if (stepType === "OPENAI_TEXT") {
    const prompt =
      typeof safeConfig.prompt === "string"
        ? safeConfig.prompt
        : "Analyze this input and return structured JSON.";

    return runOpenAITextAction({
      prompt,
      inputData: safeInput,
    });
  }

  if (stepType === "HTTP_REQUEST") {
    return {
      action: "HTTP_REQUEST",
      status: "completed",
      message: "HTTP request placeholder completed.",
      receivedInput: safeInput,
    };
  }

  if (stepType === "FILTER") {
    return {
      action: "FILTER",
      status: "completed",
      passed: true,
      receivedInput: safeInput,
    };
  }

  if (stepType === "TRANSFORM") {
    return {
      action: "TRANSFORM",
      status: "completed",
      transformedData: safeInput,
    };
  }

  throw new Error(`Unsupported step type: ${stepType}`);
}

export async function runWorkflowExecution(executionId: string) {
  const execution = await prisma.workflowExecution.findUnique({
    where: {
      id: executionId,
    },
    include: {
      workflow: {
        include: {
          steps: {
            orderBy: {
              position: "asc",
            },
          },
        },
      },
      steps: {
        orderBy: {
          position: "asc",
        },
      },
    },
  });

  if (!execution) {
    throw new Error(`Execution not found: ${executionId}`);
  }

  if (execution.status === "SUCCESS") {
    return execution;
  }

  await prisma.workflowExecution.update({
    where: {
      id: execution.id,
    },
    data: {
      status: "RUNNING",
      startedAt: new Date(),
    },
  });

  let currentInput: unknown = execution.inputData;

  try {
    for (const workflowStep of execution.workflow.steps) {
      const executionStep = execution.steps.find(
        (step) => step.stepId === workflowStep.id
      );

      if (!executionStep) {
        throw new Error(`Execution step missing for ${workflowStep.name}`);
      }

      await prisma.workflowExecutionStep.update({
        where: {
          id: executionStep.id,
        },
        data: {
          status: "RUNNING",
          startedAt: new Date(),
          inputData: toJsonValue(currentInput),
        },
      });

      const stepOutput = await runStep(
        workflowStep.type,
        workflowStep.config,
        currentInput
      );

      await prisma.workflowExecutionStep.update({
        where: {
          id: executionStep.id,
        },
        data: {
          status: "SUCCESS",
          outputData: stepOutput,
          finishedAt: new Date(),
        },
      });

      currentInput = stepOutput;
    }

    const updatedExecution = await prisma.workflowExecution.update({
      where: {
        id: execution.id,
      },
      data: {
        status: "SUCCESS",
        outputData: toJsonValue(currentInput),
        finishedAt: new Date(),
      },
    });

    return updatedExecution;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Workflow execution failed.";

    await prisma.workflowExecution.update({
      where: {
        id: execution.id,
      },
      data: {
        status: "FAILED",
        errorMessage: message,
        finishedAt: new Date(),
      },
    });

    throw error;
  }
}
