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

export async function getChatList() {
  const chats = await db.chat.findMany({
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      updatedAt: true,
      model: true,
      messages: {
        orderBy: { createdAt: 'asc' },
        take: 1
      }
    }
  });

  return chats.map((chat: any) => ({
    id: chat.id,
    title: chat.messages[0]?.content.substring(0, 50) || 'New Chat',
    updatedAt: chat.updatedAt,
    model: chat.model
  }));
}