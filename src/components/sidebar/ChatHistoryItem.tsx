import { NavItem } from "@/components/sidebar/Sidebar";

interface ChatHistoryItemProps {
  id: string;
  title: string;
  updatedAt: Date;
  isCollapsed: boolean;
}

export function ChatHistoryItem({ id, title, isCollapsed }: ChatHistoryItemProps) {
  return (
    <NavItem
      icon={<span className="text-sm">💬</span>}
      label={title}
      href={`/chat/${id}`}
      isCollapsed={isCollapsed}
    />
  );
} 