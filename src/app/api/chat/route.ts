import { convertToModelMessages, streamText, UIMessage } from "ai";
// import { huggingface } from "@ai-sdk/huggingface";
import { createHuggingFace } from "@ai-sdk/huggingface";

const huggingface = createHuggingFace({
  apiKey: process.env.HUGGINGFACE_API_KEY ?? "",
});

// Allow streaming responses up to 30 seconds
export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();

  const result = streamText({
    model: huggingface("meta-llama/Llama-3.1-8B-Instruct"),
    system: "You are a helpful assistant.",
    messages: await convertToModelMessages(messages),
  });

  return result.toUIMessageStreamResponse();
}
