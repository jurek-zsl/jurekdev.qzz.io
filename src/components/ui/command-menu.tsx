"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";
import { PROJECTS } from "@/data/projects";
import { POSTS } from "@/data/posts";
import { toggleThemeWithAnimation } from "@/lib/theme-mode";

interface CommandMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onOpenContact?: () => void;
}

export function CommandMenu({ open, onOpenChange, onOpenContact }: CommandMenuProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [menuData, setMenuData] = useState<{
    projects: typeof PROJECTS;
    posts: typeof POSTS;
    email: string;
  }>({
    projects: PROJECTS,
    posts: [],
    email: "george@otcsoft.com",
  });

  useEffect(() => {
    if (open) {
      fetch("/api/admin/data")
        .then((res) => res.json())
        .then((resData) => {
          if (resData) {
            setMenuData({
              projects: Array.isArray(resData.projects) ? resData.projects : PROJECTS,
              posts: Array.isArray(resData.posts) ? resData.posts : [],
              email: resData.profile?.email || "george@otcsoft.com",
            });
          }
        })
        .catch(() => {});
    }
  }, [open]);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open, onOpenChange]);

  const handleSelect = (callback: () => void) => {
    onOpenChange(false);
    callback();
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(menuData.email);
    toast.success(`OK: Copied ${menuData.email}`);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-[#000000]/80" />
        <Dialog.Content className="fixed left-1/2 top-[15%] z-50 w-full max-w-xl -translate-x-1/2 border border-[#e5e5e5] bg-[#000000] p-0 font-mono text-[#e5e5e5]">
          <Command
            value={search}
            onValueChange={setSearch}
            className="flex h-full w-full flex-col"
          >
            {/* Header */}
            <div className="flex items-center border-b border-[#e5e5e5] px-3 py-2 text-xs">
              <span className="text-[#38bdf8] mr-2">CMD&gt;</span>
              <Command.Input
                placeholder="Type command or jump target..."
                className="w-full bg-transparent text-xs text-[#e5e5e5] placeholder:text-[#e5e5e5]/40 outline-none"
                autoFocus
              />
              <span className="border border-[#e5e5e5] px-1 text-[10px]">
                ESC
              </span>
            </div>

            {/* List */}
            <Command.List className="max-h-[320px] overflow-y-auto p-2 divide-y divide-[#e5e5e5]/30">
              <Command.Empty className="py-6 text-center text-xs text-[#e5e5e5]">
                [NO MATCHING COMMANDS]
              </Command.Empty>

              {/* Navigation */}
              <Command.Group
                heading="=== NAVIGATION ==="
                className="px-2 py-1 text-[11px] font-bold text-[#38bdf8]"
              >
                <Command.Item
                  onSelect={() => handleSelect(() => router.push("/"))}
                  className="flex cursor-pointer items-center justify-between px-2 py-1.5 text-xs text-[#e5e5e5] aria-selected:bg-[#38bdf8] aria-selected:text-[#000000]"
                >
                  <span>&gt; 01: GOTO_ROOT [ / ]</span>
                  <span>[ENTER]</span>
                </Command.Item>

                <Command.Item
                  onSelect={() => handleSelect(() => router.push("/projects"))}
                  className="flex cursor-pointer items-center justify-between px-2 py-1.5 text-xs text-[#e5e5e5] aria-selected:bg-[#38bdf8] aria-selected:text-[#000000]"
                >
                  <span>&gt; 02: GOTO_PROJECTS [ /projects ]</span>
                  <span>[ENTER]</span>
                </Command.Item>

                <Command.Item
                  onSelect={() => handleSelect(() => router.push("/blog"))}
                  className="flex cursor-pointer items-center justify-between px-2 py-1.5 text-xs text-[#e5e5e5] aria-selected:bg-[#38bdf8] aria-selected:text-[#000000]"
                >
                  <span>&gt; 03: GOTO_BLOG [ /blog ]</span>
                  <span>[ENTER]</span>
                </Command.Item>

                <Command.Item
                  onSelect={() => handleSelect(() => router.push("/admin"))}
                  className="flex cursor-pointer items-center justify-between px-2 py-1.5 text-xs text-[#e5e5e5] aria-selected:bg-[#38bdf8] aria-selected:text-[#000000]"
                >
                  <span>&gt; 04: GOTO_ADMIN [ /admin ]</span>
                  <span className="text-[#38bdf8] font-bold">[ROOT]</span>
                </Command.Item>
              </Command.Group>

              {/* Projects */}
              <Command.Group
                heading="=== PROJECTS ==="
                className="mt-2 px-2 py-1 text-[11px] font-bold text-[#38bdf8]"
              >
                {menuData.projects.map((project) => (
                  <Command.Item
                    key={project.id}
                    value={`${project.title} ${project.category} ${project.techStack.join(" ")}`}
                    onSelect={() => handleSelect(() => router.push(`/projects?highlight=${project.id}`))}
                    className="flex cursor-pointer items-center justify-between px-2 py-1.5 text-xs text-[#e5e5e5] aria-selected:bg-[#38bdf8] aria-selected:text-[#000000]"
                  >
                    <span>&gt; {project.title} [{project.category}]</span>
                    <span className="text-[10px]">[OPEN]</span>
                  </Command.Item>
                ))}
              </Command.Group>

              {/* Articles (Only shown if posts exist) */}
              {menuData.posts.length > 0 && (
                <Command.Group
                  heading="=== ARTICLES ==="
                  className="mt-2 px-2 py-1 text-[11px] font-bold text-[#38bdf8]"
                >
                  {menuData.posts.map((post) => (
                    <Command.Item
                      key={post.slug}
                      value={`${post.title} ${post.category}`}
                      onSelect={() => handleSelect(() => router.push(`/blog/${post.slug}`))}
                      className="flex cursor-pointer items-center justify-between px-2 py-1.5 text-xs text-[#e5e5e5] aria-selected:bg-[#38bdf8] aria-selected:text-[#000000]"
                    >
                      <span className="line-clamp-1">&gt; {post.title}</span>
                      <span className="text-[10px] shrink-0">[{post.readingTime}]</span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {/* Theme Mode Actions */}
              <Command.Group
                heading="=== THEME MODE ==="
                className="mt-2 px-2 py-1 text-[11px] font-bold text-[#38bdf8]"
              >
                <Command.Item
                  value="toggle theme mode dark light"
                  onSelect={() =>
                    handleSelect(() => {
                      const next = toggleThemeWithAnimation();
                      toast.success(`THEME: ${next.toUpperCase()} MODE ACTIVE`);
                    })
                  }
                  className="flex cursor-pointer items-center justify-between px-2 py-1.5 text-xs text-[#e5e5e5] aria-selected:bg-[#38bdf8] aria-selected:text-[#000000]"
                >
                  <span>&gt; TOGGLE_THEME [DARK / LIGHT]</span>
                  <span>[TOGGLE ◐]</span>
                </Command.Item>
              </Command.Group>

              {/* Actions */}
              <Command.Group
                heading="=== SYSTEM ACTIONS ==="
                className="mt-2 px-2 py-1 text-[11px] font-bold text-[#38bdf8]"
              >
                {onOpenContact && (
                  <Command.Item
                    onSelect={() => handleSelect(onOpenContact)}
                    className="flex cursor-pointer items-center justify-between px-2 py-1.5 text-xs text-[#e5e5e5] aria-selected:bg-[#38bdf8] aria-selected:text-[#000000]"
                  >
                    <span>&gt; OPEN_CONTACT_PROMPT</span>
                    <span>[EXEC]</span>
                  </Command.Item>
                )}

                <Command.Item
                  onSelect={() => handleSelect(copyEmail)}
                  className="flex cursor-pointer items-center justify-between px-2 py-1.5 text-xs text-[#e5e5e5] aria-selected:bg-[#38bdf8] aria-selected:text-[#000000]"
                >
                  <span>&gt; COPY_EMAIL [{menuData.email}]</span>
                  <span>[COPY]</span>
                </Command.Item>

                <Command.Item
                  onSelect={() => handleSelect(() => window.open("https://github.com/jurek-zsl", "_blank"))}
                  className="flex cursor-pointer items-center justify-between px-2 py-1.5 text-xs text-[#e5e5e5] aria-selected:bg-[#38bdf8] aria-selected:text-[#000000]"
                >
                  <span>&gt; OPEN_GITHUB_PROFILE [@jurek-zsl]</span>
                  <span>[URL]</span>
                </Command.Item>
              </Command.Group>
            </Command.List>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-[#e5e5e5] bg-[#000000] px-3 py-1.5 text-[10px] text-[#e5e5e5]">
              <span>NAV: [UP/DOWN] · SELECT: [ENTER]</span>
              <span className="text-[#38bdf8]">jurekdev.qzz.io</span>
            </div>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
