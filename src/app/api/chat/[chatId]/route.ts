import { getChat } from "@/lib/db/chat";
import { NextResponse } from "next/server";

export async function GET(request: Request, { params }: { params: { chatId: string } }) {
  try {
    const { chatId } = await params;
    const chat = await getChat(chatId);
    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }
    return NextResponse.json(chat);
  } catch (error) {
    // Log the actual error
    console.error("Chat fetch error:", error);
    return NextResponse.json(
      { error: "Failed to load chat", details: (error as Error).message },
      { status: 500 }
    );
  }
} 