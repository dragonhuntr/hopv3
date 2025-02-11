import { litellm } from '@/lib/ai/index';
import { appendResponseMessages, streamText } from 'ai';
import { saveChat } from "@/lib/db/chat";

export async function POST(req: Request) {
  const { id, messages, model } = await req.json();

  const result = streamText({
    model: litellm(model),
    messages,
    async onFinish({ response }) {
      await saveChat({
        id,
        messages: appendResponseMessages({
          messages,
          responseMessages: response.messages,
        }),
      });
    },
  });

  return result.toDataStreamResponse();
}