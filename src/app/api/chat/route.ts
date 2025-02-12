import { litellm } from '@/lib/ai/index';
import { appendResponseMessages, smoothStream, streamText } from 'ai';
import { saveChat } from "@/lib/db/chat";
import { systemPrompt } from '@/lib/ai/prompts';

export async function POST(req: Request) {
  const { id, messages, model } = await req.json();

  const result = streamText({
    model: litellm(model),
    system: systemPrompt,
    messages,
    experimental_transform: smoothStream(),
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

  // allow the stream to finish even if the client disconnects
  result.consumeStream();

  return result.toDataStreamResponse();
}