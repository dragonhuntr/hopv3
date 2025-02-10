import { ChatContainer } from "@/components/ChatContainer";

  
  export default async function ChatPage(props: { params: Promise<{ chatId: string }> }) {
    const params = await props.params;
    const { chatId } = params;
    
    return <ChatContainer chatId={chatId} />;
  }