import { getChat } from "@/lib/db/chat";
import { NextResponse } from "next/server";
import { auth } from "@/app/auth";

export async function GET(req: Request, { params }: { params: { chatId: string } }) {
  try {
    const session = await auth.api.getSession({
      headers: req.headers
    });

    if (!session?.user) return new Response('Unauthorized', { status: 401 });

    const { chatId } = await params;
    const chat = await getChat(chatId, session.user.id);
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