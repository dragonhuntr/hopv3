'use client';

import Link from "next/link";
import { Archive, Plus, ChevronLeft, ChevronRight, Menu } from "lucide-react";
import { useState, useEffect } from "react";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  isCollapsed: boolean;
}

const NavItem = ({ icon, label, href, isCollapsed }: NavItemProps) => (
  <Link 
    href={href}
    className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-800 rounded-lg"
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

  // Detect mobile screens
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isMobileOpen && isMobile) {
        const sidebar = document.querySelector('aside');
        if (sidebar && !sidebar.contains(e.target as Node)) {
          setIsMobileOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobileOpen, isMobile]);

  return (
    <>
      {/* Mobile Toggle When Closed */}
      {isMobile && !isMobileOpen && (
        <button
          className="fixed md:hidden top-4 left-4 p-2 z-50 bg-[#1C1C1C] rounded-lg"
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open sidebar"
        >
          <ChevronRight size={16} />
        </button>
      )}

      {/* Sidebar */}
      <aside className={`
        fixed md:relative h-full z-40
        bg-[#1C1C1C] border-r border-gray-800 p-4
        flex flex-col transition-all duration-300
        ${isMobile ? 
          `w-64 md:w-auto transform ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0` : 
          `${isCollapsed ? 'w-20' : 'w-64'}`
        }
      `}>
        <div className="flex items-center justify-between">
          {!isCollapsed && <span className="font-semibold">[hop]v3</span>}
          <button 
            onClick={() => isMobile ? setIsMobileOpen(false) : setIsCollapsed(!isCollapsed)}
            className="p-2 ml-2 hover:bg-gray-800 rounded-lg"
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
        
        <nav className="mt-4 space-y-2 text-sm">
          <NavItem icon={<Plus size={14}/>} label="New thread" href="/" isCollapsed={isCollapsed} />
          <NavItem icon={<Archive size={14}/>} label="Folders" href="/folders" isCollapsed={isCollapsed} />
        </nav>

        {!isCollapsed && (
          <div className="mt-auto">
            <div className="px-4 py-4">
              <h3 className="text-sm font-medium">hop accounts</h3>
              <p className="text-sm text-gray-400 mt-1">
                make yours now! get access to saved threads, experiments and more features.
              </p>
              <div className="mt-4 space-y-2">
                <button className="w-full px-4 py-2 text-sm text-white bg-gray-800 rounded-lg hover:bg-gray-700">
                  Login
                </button>
                <button className="w-full px-4 py-2 text-sm text-white bg-purple-600 rounded-lg hover:bg-purple-500">
                  Sign up
                </button>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Mobile Backdrop */}
      {isMobileOpen && isMobile && (
        <div className="fixed inset-0 bg-black/50 md:hidden z-30" />
      )}
    </>
  );
} 