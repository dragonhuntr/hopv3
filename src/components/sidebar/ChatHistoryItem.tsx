import { NavItem } from "@/components/sidebar/Sidebar";

interface ChatHistoryItemProps {
  id: string;
  name: string;
  isPrivate: boolean;
  isCollapsed: boolean;
}

export function ChatHistoryItem({ id, name, isPrivate, isCollapsed }: ChatHistoryItemProps) {
  return (
    <NavItem
      icon={<span className="text-sm">💬</span>}
      label={name}
      href={`/chat/${id}`}
      isCollapsed={isCollapsed}
    />
  );
} 