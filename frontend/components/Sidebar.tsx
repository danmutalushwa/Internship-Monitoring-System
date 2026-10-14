'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  ClipboardList,
  FileText,
  MessageSquare,
  Users,
  Settings,
  LogOut,
  ShieldCheck,
  BookOpen,
  Briefcase,
} from 'lucide-react';
import { useUserContext } from '../context/userContext';

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUserContext();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    router.push('/auth/login');
  };

  if (!user) return null;

  const role = user.role.toLowerCase();

  const commonLinks = [
    { href: `/${role}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
  ];

  const roleLinks: Record<string, { href: string; label: string; icon: any }[]> = {
    student: [
      { href: '/student/internships', label: 'Internships', icon: ClipboardList },
      { href: '/student/reports', label: 'Reports', icon: FileText },
      { href: '/student/feedback', label: 'Feedback', icon: MessageSquare },
    ],
    supervisor: [
      { href: '/supervisor/assigned-students', label: 'Assigned Students', icon: Users },
      { href: '/supervisor/review-reports', label: 'Review Reports', icon: FileText },
      { href: '/supervisor/feedback', label: 'Feedback', icon: MessageSquare },
    ],
    lecturer: [
      { href: '/lecturer/students', label: 'My Students', icon: BookOpen },
      { href: '/lecturer/reports', label: 'Monitor Reports', icon: FileText },
      { href: '/lecturer/feedback', label: 'Feedback', icon: MessageSquare },
    ],
    dean: [
      { href: '/dean/students', label: 'Students', icon: Users },
      { href: '/dean/lecturers', label: 'Lecturers', icon: BookOpen },
      { href: '/dean/assignments', label: 'Assign Students', icon: ClipboardList },
      { href: '/dean/reports', label: 'Reports', icon: FileText },
      { href: '/dean/analytics', label: 'Analytics', icon: Briefcase },
    ],
    admin: [
      { href: '/admin/users', label: 'Manage Users', icon: Users },
      { href: '/admin/reports', label: 'All Reports', icon: FileText },
      { href: '/admin/reviewers', label: 'Reviewer Analytics', icon: ClipboardList },
      { href: '/admin/roles', label: 'Roles & Permissions', icon: ShieldCheck },
      { href: '/admin/settings', label: 'Settings', icon: Settings },
    ],
  };

  const navLinks = [...commonLinks, ...(roleLinks[role] || [])];

  return (
    <aside className="fixed top-0 left-0 flex-col hidden w-64 h-screen bg-white border-r border-gray-200 shadow-sm lg:flex">
      
      {/* Logo Section */}
      <div className="flex items-center gap-2 p-4 border-b border-gray-200">
        <img src="/logo.JPG" alt="Logo" className="w-6 h-6" />
        <span className="text-xl font-bold">UoK Internship</span>
      </div>

      {/* Navigation Links */}
      <nav className="p-4 space-y-2">
        {navLinks.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-all duration-200
                ${
                  isActive
                   ? "bg-sky-100 text-sky-600 shadow-sm ring-1 ring-sky-500/20"
                   : "text-black visited:text-sky-600 hover:text-sky-600 hover:bg-sky-50 active:text-sky-800"
                 }`}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout at Bottom */}
      <div className="p-4 mt-auto border-t border-gray-300">
        <button
          onClick={handleLogout}
          className="flex items-center w-full gap-3 p-2 text-gray-700 transition rounded-lg hover:bg-red-50 hover:text-red-600"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </aside>
  );
}
