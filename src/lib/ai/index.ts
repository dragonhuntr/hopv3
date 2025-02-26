import { getAuthHeaders } from '@/lib/auth';

// Types
export interface Chat {
  id: string;
  name: string;
  isPrivate: boolean;
  createdAt: string;
}

export interface Message {
  id: string;
  chatId: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface CreateChatRequest {
  id: string;
  name: string;
  isPrivate: boolean;
}

interface SendMessageRequest {
  content: string;
  model: string;
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

// Chat Functions
export async function getChats(): Promise<Chat[]> {
  const response = await fetch(`${API_BASE}/api/chats`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return response.json();
}

export async function createChat(data: CreateChatRequest): Promise<Chat> {
  const response = await fetch(`${API_BASE}/api/chats`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return response.json();
}

export async function getChat(chatId: string): Promise<Chat> {
  const response = await fetch(`${API_BASE}/api/chats/${chatId}`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return response.json();
}

export async function getChatMessages(chatId: string): Promise<Message[]> {
  const response = await fetch(`${API_BASE}/api/chats/${chatId}/messages`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return response.json();
}

export async function sendMessage(chatId: string, data: SendMessageRequest): Promise<ReadableStream> {
  const response = await fetch(`${API_BASE}/api/chats/${chatId}/messages`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(response.statusText);
  }

  return response.body!;
}