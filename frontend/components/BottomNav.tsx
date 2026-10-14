'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  MessageSquare,
  Users,
  Settings,
} from 'lucide-react';
import { useUserContext } from '../context/userContext';

export default function BottomNav() {
  const pathname = usePathname();
  const { user } = useUserContext();

  if (!user) return null;

  const role = user.role.toLowerCase();

  const roleNavLinks: Record<string, { href: string; icon: any }[]> = {
    student: [
      { href: '/student/dashboard', icon: LayoutDashboard },
      { href: '/student/internships', icon: ClipboardList },
      { href: '/student/reports', icon: FileText },
      { href: '/student/feedback', icon: MessageSquare },
    ],
    supervisor: [
      { href: '/supervisor/dashboard', icon: LayoutDashboard },
      { href: '/supervisor/students', icon: Users },
      { href: '/supervisor/reports', icon: FileText },
      { href: '/supervisor/feedback', icon: MessageSquare },
    ],
    lecturer: [
      { href: '/lecturer/dashboard', icon: LayoutDashboard },
      { href: '/lecturer/students', icon: Users },
      { href: '/lecturer/reports', icon: FileText },
      { href: '/lecturer/feedback', icon: MessageSquare },
    ],
    dean: [
      { href: '/dean/dashboard', icon: LayoutDashboard },
      { href: '/dean/students', icon: Users },
      { href: '/dean/lecturers', icon: Users },
      { href: '/dean/assignments', icon: ClipboardList },
      { href: '/dean/reports', icon: FileText },
      { href: '/dean/analytics', icon: Settings }, 
    ],
    admin: [
      { href: '/admin/dashboard', icon: LayoutDashboard },
      { href: '/admin/users', icon: Users },
      { href: '/admin/reports', icon: FileText },
      { href: '/admin/settings', icon: Settings },
    ],
  };

  const navLinks = roleNavLinks[role] || [];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-sm flex justify-around py-[25px] px-4 z-40">
      {navLinks.map(({ href, icon: Icon }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-1 transition-colors duration-200 ease-in-out ${
              isActive 
                    ? 'text-blue-600 bg-blue-50 ring-1 ring-blue-500/200' 
                    : 'text-gray-600 visited:text-blue-600 hover:text-blue-600 hover:bg-blue-50 active:text-blue-800'
                    
            }`}
          >
            <Icon size={22} className="text-inherit" />
          </Link>
        );
      })}
    </nav>
  );
}