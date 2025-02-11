import { db } from "@/server/db";
import type { Message as AIMessage } from "ai";

export async function saveChat({ id, messages, model }: { id: string; messages: AIMessage[], model: string }) {
  // Upsert the chat
  await db.chat.upsert({
    where: { id },
    create: { id, model },
    update: { updatedAt: new Date() },
  });

  // Save all messages using upsert instead of create
  await Promise.all(
    messages.map((message) =>
      db.message.upsert({
        where: { id: message.id },
        create: {
          id: message.id,
          chatId: id,
          role: message.role,
          content: message.content,
        },
        update: {
          content: message.content, // Only update content if message exists
        },
      })
    )
  );
}

export async function getChat(id: string) {
  const chat = await db.chat.findUnique({
    where: { id },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!chat) return null;

  return {
    ...chat,
    messages: chat.messages.map((msg: AIMessage) => ({
      id: msg.id,
      role: msg.role,
      content: msg.content,
    })),
  };
} 