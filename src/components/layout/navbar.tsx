"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { CommandMenu } from "../ui/command-menu";
import { ContactModal } from "../ui/contact-modal";
import { ThemeSwitcher } from "../ui/theme-switcher";

export function Navbar() {
  const pathname = usePathname();
  const [commandOpen, setCommandOpen] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "01:OVERVIEW", href: "/" },
    { label: "02:PROJECTS", href: "/projects" },
    { label: "03:BLOG", href: "/blog" },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-[#e5e5e5] bg-[#000000] text-[#e5e5e5] font-mono">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-3 sm:px-6">
          {/* Logo / Prompt */}
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-[#38bdf8] font-bold">┌─[</span>
              <span className="text-[#e5e5e5] font-bold group-hover:text-[#38bdf8]">
                jurek@qzz.io
              </span>
              <span className="text-[#38bdf8] font-bold">]</span>
            </Link>

            <span className="hidden lg:inline text-[11px] text-[#38bdf8]">
              [*] READY
            </span>
          </div>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-2">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(link.href);

              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "px-2.5 py-1 text-xs transition-colors",
                    isActive
                      ? "bg-[#38bdf8] text-[#000000] font-bold"
                      : "text-[#e5e5e5] hover:text-[#38bdf8]"
                  )}
                >
                  [{link.label}]
                </Link>
              );
            })}
          </nav>

          {/* Right Action Utilities */}
          <div className="flex items-center gap-2">
            <ThemeSwitcher />

            <button
              onClick={() => setCommandOpen(true)}
              className="border border-[#e5e5e5] bg-[#000000] px-2.5 py-1 text-xs text-[#e5e5e5] hover:border-[#38bdf8] hover:text-[#38bdf8] cursor-pointer hidden sm:inline-block"
            >
              [SEARCH: ^K]
            </button>

            <button
              onClick={() => setContactOpen(true)}
              className="border border-[#38bdf8] bg-[#000000] px-2.5 py-1 text-xs text-[#38bdf8] hover:bg-[#38bdf8] hover:text-[#000000] cursor-pointer transition-colors duration-150 select-none font-bold"
            >
              [CONTACT]
            </button>

            {/* Mobile Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden border border-[#e5e5e5] px-2 py-1 text-xs text-[#e5e5e5]"
            >
              {mobileMenuOpen ? "[X]" : "[=]"}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown */}
        {mobileMenuOpen && (
          <div className="border-t border-[#e5e5e5] bg-[#000000] p-3 md:hidden">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-3 py-1.5 text-xs",
                    pathname === link.href
                      ? "bg-[#38bdf8] text-[#000000] font-bold"
                      : "text-[#e5e5e5] hover:text-[#38bdf8]"
                  )}
                >
                  &gt; {link.label}
                </Link>
              ))}
              <div className="pt-2 border-t border-[#e5e5e5]/40 flex items-center justify-between">
                <span className="text-[11px] text-[#e5e5e5]/70">APPEARANCE:</span>
                <ThemeSwitcher />
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Modals */}
      <CommandMenu
        open={commandOpen}
        onOpenChange={setCommandOpen}
        onOpenContact={() => setContactOpen(true)}
      />
      <ContactModal open={contactOpen} onOpenChange={setContactOpen} />
    </>
  );
}
