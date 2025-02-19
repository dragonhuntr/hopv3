import { useEffect, useRef } from 'react';
import Link from 'next/link';

interface UserMenuProps {
  userEmail: string;
  onLogout: () => void;
  onClose: () => void;
}

export function UserMenu({ userEmail, onLogout, onClose }: UserMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  return (
    <div
      ref={menuRef}
      className="absolute left-0 bottom-10 z-10 min-w-[200px] rounded-lg bg-gray-900 p-2 shadow-xl"
      role="menu"
    >
      <div className="px-3 py-2 text-sm text-gray-300 border-b border-gray-700">
        {userEmail}
      </div>
      <Link
        href="/settings"
        className="block w-full rounded px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700"
        role="menuitem"
      >
        Settings
      </Link>
      <button
        onClick={onLogout}
        className="w-full rounded px-3 py-2 text-left text-sm text-gray-300 hover:bg-gray-700"
        role="menuitem"
      >
        Logout
      </button>
    </div>
  );
} 