import { db } from "@/server/db";
import type { Message as AIMessage } from "ai";

export async function saveChat({ id, messages, model }: { id: string; messages: AIMessage[], model: string }) {
  // Upsert the chat
  await db.chat.upsert({
    where: { id },
    create: { id, model },
    update: { updatedAt: new Date() },
  });

  // Save messages in sequence with proper timestamps
  for (const message of messages) {
    await db.message.upsert({
      where: { id: message.id },
      create: {
        id: message.id,
        chatId: id,
        role: message.role,
        content: message.content,
        createdAt: message.createdAt || new Date(), // Use message timestamp if available
      },
      update: {
        content: message.content,
      },
    });
  }
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