import Anthropic from "@anthropic-ai/sdk";

export type ClaudeOptions = {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  apiKey?: string;
};

const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 2000,
  maxDelayMs: 30000,
  backoffFactor: 2,
};

export async function callClaudeWithRetry(systemPrompt: string, data: any) {
  let retryCount = 0;
  let delay = RETRY_CONFIG.initialDelayMs;

  while (true) {
    try {
      return await callClaude(systemPrompt, data);
    } catch (error: any) {

      const isOverloaded =
        error?.status === 529 ||
        error?.error?.type === "overloaded_error" ||
        (error.message && error.message.includes("Overloaded"));


      if (!isOverloaded || retryCount >= RETRY_CONFIG.maxRetries) {
        throw error;
      }


      retryCount++;

      await new Promise((resolve) => setTimeout(resolve, delay));


      delay = Math.min(
        delay * RETRY_CONFIG.backoffFactor,
        RETRY_CONFIG.maxDelayMs
      );
    }
  }
}

export async function callClaude(
  systemPrompt: string,
  inputData: any
): Promise<any> {

  const normalizedInput =
    typeof inputData === "string" ? inputData : JSON.stringify(inputData);

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error("Anthropic API key is required but not provided");
  }

  try {
    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    const message = await anthropic.messages.create({
      model: "claude-3-5-sonnet-latest",
      max_tokens: 4096,
      temperature: 0.7,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: normalizedInput,
        },
      ],
    });

    return message;
  } catch (error) {
    console.error("Error calling Anthropic API:", error);
    throw error;
  }
}
