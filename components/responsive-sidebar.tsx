"use client";

import { useState, useEffect, ReactNode } from "react";
import { LucideMenu, LucideX } from "lucide-react";
import Link from "next/link";

interface SidebarLink {
  href: string;
  label: string;
  icon: ReactNode;
  onClick?: () => void;
}

interface ResponsiveSidebarProps {
  links: SidebarLink[];
  logo: {
    text: string;
    href: string;
  };
  footer?: ReactNode;
  children?: ReactNode;
}

export function ResponsiveSidebar({
  links,
  logo,
  footer,
  children
}: ResponsiveSidebarProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Fermer la sidebar quand on clique sur un lien (sur mobile)
  const handleNavClick = () => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Fermer la sidebar quand on redimensionne la fenêtre
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile Header with Menu Toggle */}
      <div className="md:hidden bg-gray-800 dark:bg-gray-950 text-white p-4 flex items-center justify-between sticky top-0 z-50">
        <Link href={logo.href} className="text-xl font-bold">
          {logo.text}
        </Link>
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-md hover:bg-gray-700 focus:outline-none"
          aria-label="Toggle menu"
        >
          {sidebarOpen ? (
            <LucideX className="w-6 h-6" />
          ) : (
            <LucideMenu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Sidebar - Mobile: fixed overlay, Desktop: static sidebar */}
      <aside 
        className={`
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
          md:translate-x-0 
          transition-transform duration-300 ease-in-out 
          w-full md:w-64 bg-gray-800 dark:bg-gray-950 text-white 
          fixed md:static top-0 left-0 h-full z-40 md:z-0 
          flex flex-col justify-between 
          md:pt-0 pt-16
        `}
      >
        {/* Logo - Hidden on mobile as it's in the header */}
        <div className="hidden md:block p-6">
          <Link href={logo.href} className="text-xl font-bold">
            {logo.text}
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
          {links.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="flex items-center px-6 py-3 text-gray-300 hover:bg-gray-700 hover:text-white"
              onClick={() => {
                handleNavClick();
                if (link.onClick) link.onClick();
              }}
            >
              <span className="w-5 h-5 mr-3">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer Section (usually logout button) */}
        {footer && (
          <div className="border-t border-gray-700 w-full">
            {footer}
          </div>
        )}
      </aside>

      {/* Overlay to close sidebar when clicking outside on mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" 
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main content */}
      <main className="flex-1 overflow-x-hidden overflow-y-auto p-4 md:p-8">
        {children}
      </main>
    </div>
  );
}
