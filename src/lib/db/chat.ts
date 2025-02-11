import { db } from "@/server/db";
import type { Message as AIMessage } from "ai";

export async function saveChat({ id, messages }: { id: string; messages: AIMessage[] }) {
  // Upsert the chat
  await db.chat.upsert({
    where: { id },
    create: { id },
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
    messages: chat.messages.map((msg) => ({
      id: msg.id,
      role: msg.role as AIMessage["role"],
      content: msg.content,
    })),
  };
} 