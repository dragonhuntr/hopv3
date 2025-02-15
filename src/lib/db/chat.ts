import { db } from "@/server/db";
import type { Message as AIMessage } from "ai";

export async function saveChat({ 
  id, 
  messages, 
  model,
  userId
}: { 
  id: string; 
  messages: AIMessage[]; 
  model: string;
  userId: string;
}) {
  await db.chat.upsert({
    where: { id, userId },
    create: { 
      id,
      model,
      userId,
      title: "New Chat",
      messages: {
        create: messages.map(message => ({
          id: message.id,
          role: message.role,
          content: message.content,
          createdAt: message.createdAt || new Date(),
        }))
      }
    },
    update: {
      updatedAt: new Date(),
      messages: {
        upsert: messages.map(message => ({
          where: { id: message.id },
          create: {
            id: message.id,
            role: message.role,
            content: message.content,
            createdAt: message.createdAt || new Date(),
          },
          update: {
            content: message.content,
          }
        }))
      }
    },
  });
}

export async function updateChatTitle({ id, title }: { id: string; title: string }) {
  await db.chat.update({
    where: { id },
    data: { title }
  });
}

export async function getChat(id: string, userId: string) {
  const chat = await db.chat.findUnique({
    where: { id, userId },
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

export async function getChatList(userId: string) {
  const chats = await db.chat.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      title: true,
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
    title: chat.title,
    updatedAt: chat.updatedAt,
    model: chat.model
  }));
}