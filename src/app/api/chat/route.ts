import { litellm } from '@/lib/ai/index';
import { appendResponseMessages, smoothStream, streamText } from 'ai';
import { saveChat, getChat, updateChatTitle } from "@/lib/db/chat";
import { systemPrompt } from '@/lib/ai/prompts';
import type { Message } from 'ai';

import { generateText } from "ai";
import { titlePrompt } from "@/lib/ai/prompts";
import { DEFAULT_TITLE_MODEL_ID } from "@/lib/ai/models";

export async function generateChatTitle(content: string) {
  const response = await generateText({
    model: litellm(DEFAULT_TITLE_MODEL_ID),
    prompt: titlePrompt(content),
  });
  return response.text;
}

export async function POST(req: Request) {
  const { id, messages, model } = await req.json();
  const isNew = !(await getChat(id));

  // Save initial chat with temporary title
  await saveChat({ id, model, messages });

  // Generate and update title immediately for new chats
  if (isNew) {
    const firstUserMessage = messages.find((m: Message) => m.role === 'user');
    if (firstUserMessage) {
      const title = await generateChatTitle(firstUserMessage.content);
      await updateChatTitle({ id, title });  // Update title before streaming
    }
  }

  const result = streamText({
    model: litellm(model),
    system: systemPrompt,
    messages,
    experimental_transform: smoothStream(),
    async onFinish({ response }) {
      // Update messages with final response
      await saveChat({
        id,
        model,
        messages: appendResponseMessages({
          messages,
          responseMessages: response.messages,
        })
      });
    },
  });

  result.consumeStream();
  return result.toDataStreamResponse();
}