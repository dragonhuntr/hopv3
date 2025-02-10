import { litellm } from '@/lib/ai/index';
import { appendResponseMessages, streamText } from 'ai';

export async function POST(req: Request) {
  const { messages, id } = await req.json();

  const result = streamText({
    model: litellm('gpt-4o-mini'),
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