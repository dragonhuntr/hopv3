import { getChatList } from "@/lib/db/chat";
import { NextResponse } from "next/server";
import { auth } from "@/app/auth";

export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers
    });
    if (!session?.user) return new Response('Unauthorized', { status: 401 });
    
    const chats = await getChatList(session.user.id);
    return NextResponse.json(chats);
  } catch (error) {
    console.error("Chat list error:", error);
    return NextResponse.json(
      { error: "Failed to load chat list" },
      { status: 500 }
    );
  }
} 