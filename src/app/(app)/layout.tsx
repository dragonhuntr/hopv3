import { Sidebar } from "@/components/sidebar/Sidebar";
import { AuthGuard } from "@/components/AuthGuard";
import { ChatProvider } from "@/context/ChatContext";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard>
      <ChatProvider>
        <div className="flex h-screen">
          <Sidebar />
          <main className="flex-1">{children}</main>
        </div>
      </ChatProvider>
    </AuthGuard>
  );
}