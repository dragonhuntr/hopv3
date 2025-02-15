"use client";

import Link from "next/link";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { ChatHistoryItem } from "@/components/ChatHistoryItem";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isCollapsed: boolean;
}

export const NavItem = ({ icon, label, href, isCollapsed }: NavItemProps) => (
  <Link
    href={href}
    className="flex items-center gap-2 rounded-lg px-4 py-2 text-gray-300 hover:bg-gray-800"
    title={isCollapsed ? label : undefined}
  >
    {icon}
    {!isCollapsed && <span>{label}</span>}
  </Link>
);

export function Sidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [chatHistory, setChatHistory] = useState<Array<{
    id: string;
    title: string;
    updatedAt: Date;
  }>>([]);

  // Detect mobile screens
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isMobileOpen && isMobile) {
        const sidebar = document.querySelector("aside");
        if (sidebar && !sidebar.contains(e.target as Node)) {
          setIsMobileOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMobileOpen, isMobile]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await fetch('/api/chats');
        const data = await response.json();
        setChatHistory(data);
      } catch (error) {
        console.error('Failed to load chat history:', error);
      }
    };
    
    fetchHistory();
    
    const handleHistoryUpdate = () => fetchHistory();
    window.addEventListener('update-chat-history', handleHistoryUpdate);
    
    return () => {
      window.removeEventListener('update-chat-history', handleHistoryUpdate);
    };
  }, []);

  return (
    <>
      {/* Mobile Toggle When Closed */}
      {isMobile && !isMobileOpen && (
        <button
          className="fixed left-4 top-4 z-50 rounded-lg bg-[#1C1C1C] p-2 md:hidden"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open sidebar"
        >
          <ChevronRight size={16} />
        </button>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-40 flex h-full flex-col border-r border-gray-800 bg-[#1C1C1C] p-4 transition-all duration-300 md:relative ${
          isMobile
            ? `w-64 transform md:w-auto ${isMobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0`
            : `${isCollapsed ? "w-20" : "w-64"}`
        } `}
      >
        <div className="flex items-center justify-between">
          {!isCollapsed && <span className="font-semibold">[hop]v3</span>}
          <button
            onClick={() =>
              isMobile ? setIsMobileOpen(false) : setIsCollapsed(!isCollapsed)
            }
            className="ml-2 rounded-lg p-2 hover:bg-gray-800"
          >
            {isMobile ? (
              <ChevronLeft size={16} />
            ) : isCollapsed ? (
              <ChevronRight size={16} />
            ) : (
              <ChevronLeft size={16} />
            )}
          </button>
        </div>

        {/* New Chat button outside scroll area */}
        <div className="mt-4 space-y-2">
          <NavItem
            icon={<Plus size={14} />}
            label="new chat"
            href="/"
            isCollapsed={isCollapsed}
          />
          <div className="my-2 border-t border-gray-800" />
        </div>

        <nav className="flex-1 space-y-2 overflow-y-auto text-sm sidebar-nav 
          [&::-webkit-scrollbar]:w-2
          [&::-webkit-scrollbar-thumb]:rounded-full
          [&::-webkit-scrollbar-thumb]:bg-transparent
          [&::-webkit-scrollbar-track]:bg-transparent
          hover:[&::-webkit-scrollbar-thumb]:bg-gray-600
          [&>*]:whitespace-nowrap [&>*]:overflow-hidden">
          {chatHistory.map((chat) => (
            <ChatHistoryItem
              key={chat.id}
              {...chat}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>

        {!isCollapsed && (
          <div className="mt-auto">
            <div className="px-4 py-4">
              <h3 className="text-sm font-medium">hop accounts</h3>
              <p className="mt-1 text-sm text-gray-400">
                make yours now! get access to saved threads, experiments and
                more features.
              </p>
              <div className="mt-4 space-y-2">
                <button className="w-full rounded-lg bg-gray-800 px-4 py-2 text-sm text-white hover:bg-gray-700">
                  Login
                </button>
                <button className="w-full rounded-lg bg-purple-600 px-4 py-2 text-sm text-white hover:bg-purple-500">
                  Sign up
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Backdrop */}
      {isMobileOpen && isMobile && (
        <div className="fixed inset-0 z-30 bg-black/50 md:hidden" />
      )}
    </>
  );
}
