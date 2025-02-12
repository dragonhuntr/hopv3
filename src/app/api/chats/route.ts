import { getChatList } from "@/lib/db/chat";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const chats = await getChatList();
    return NextResponse.json(chats);
  } catch (error) {
    console.error("Chat list error:", error);
    return NextResponse.json(
      { error: "Failed to load chat list" },
      { status: 500 }
    );
  }
} 