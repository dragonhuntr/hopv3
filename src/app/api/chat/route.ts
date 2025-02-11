import { litellm } from '@/lib/ai/index';
import { appendResponseMessages, smoothStream, streamText } from 'ai';
import { saveChat } from "@/lib/db/chat";

export async function POST(req: Request) {
  const { id, messages, model } = await req.json();

  const result = streamText({
    model: litellm(model),
    messages,
    experimental_transform: smoothStream({
      delayInMs: null,
      chunking: 'line',
    }),
    async onFinish({ response }) {
      await saveChat({
        id,
        model,
        messages: appendResponseMessages({
          messages,
          responseMessages: response.messages,
        }),
      });
    },
  });

  return result.toDataStreamResponse();
}