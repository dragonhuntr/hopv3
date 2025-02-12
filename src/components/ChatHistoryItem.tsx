import { formatDistanceToNow } from "date-fns";
import { NavItem } from "@/components/Sidebar";

interface ChatHistoryItemProps {
  id: string;
  title: string;
  updatedAt: Date;
  isCollapsed: boolean;
}

export function ChatHistoryItem({ id, title, updatedAt, isCollapsed }: ChatHistoryItemProps) {
  return (
    <NavItem
      icon={<span className="text-sm">💬</span>}
      label={title}
      href={`/chat/${id}`}
      isCollapsed={isCollapsed}
    />
  );
} 