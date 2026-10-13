"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { BlogPost } from "@/types/blog";
import { Project, ProjectCategory } from "@/types/project";
import { TechItem } from "@/data/tech-stack";
import { ProfileData, SiteData } from "@/lib/store";
import { SpotlightButton } from "@/components/ui/spotlight-button";
import {
  ACCENT_PRESETS,
  DEFAULT_ACCENT,
  isValidHexColor,
  applyAccentColor,
  getSavedAccentColor,
} from "@/lib/theme";

type AdminTab = "posts" | "projects" | "skills" | "profile" | "theme" | "raw_json";

const DEFAULT_AUTH_KEY = "jurek2026";

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [activeTab, setActiveTab] = useState<AdminTab>("posts");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [accentColorInput, setAccentColorInput] = useState<string>(DEFAULT_ACCENT);

  // Core editable datasets
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [skills, setSkills] = useState<TechItem[]>([]);
  const [profile, setProfile] = useState<ProfileData>({
    name: "Lishafai Heorhii (Jurek)",
    handle: "jurek-zsl",
    host: "jurekdev.qzz.io",
    role: "Systems · Game Dev · Extensions · Desktop Mods",
    location: "Málaga, Spain",
    status: "AVAILABLE FOR PROJECTS",
    ecosystem: "ohiofiles.cloud · Homebrew · Jellyfin",
    flagships: "ohio-cli · antiQuarantine · openclock · MumbleMica",
    bio: "High-speed Go CLIs & TUIs, native macOS system tools, real-time LAN multiplayer games, browser extensions, desktop app mods, and pure monospace web apps.",
    email: "george@otcsoft.com",
    accentColor: DEFAULT_ACCENT,
  });

  // Post Editor State
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [isCreatingPost, setIsCreatingPost] = useState(false);
  const [postPreviewMode, setPostPreviewMode] = useState(false);

  // Project Editor State
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [isCreatingProject, setIsCreatingProject] = useState(false);

  // Dev Stack / Skills Editor State
  const [editingSkill, setEditingSkill] = useState<TechItem | null>(null);
  const [editingSkillIndex, setEditingSkillIndex] = useState<number | null>(null);
  const [isCreatingSkill, setIsCreatingSkill] = useState(false);
  const [skillSearch, setSkillSearch] = useState("");
  const [selectedSkillCategory, setSelectedSkillCategory] = useState<string>("ALL");

  // Raw JSON Editor State
  const [rawJsonText, setRawJsonText] = useState("");

  // Check existing session & initialize accent
  useEffect(() => {
    const authSession = sessionStorage.getItem("jurekdev_admin_auth");
    if (authSession === "true") {
      setIsAuthenticated(true);
    }
    const saved = getSavedAccentColor();
    if (saved) {
      setAccentColorInput(saved);
      applyAccentColor(saved);
    }
  }, []);

  // Fetch data from server
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/data");
      if (!res.ok) throw new Error("Failed to fetch data");
      const data: SiteData = await res.json();
      setPosts(data.posts || []);
      setProjects(data.projects || []);
      setSkills(data.skills || []);
      if (data.profile) {
        setProfile(data.profile);
        const color = data.profile.accentColor || getSavedAccentColor() || DEFAULT_ACCENT;
        setAccentColorInput(color);
        applyAccentColor(color);
      }
      setRawJsonText(JSON.stringify(data, null, 2));
    } catch (err) {
      toast.error("ERR: Failed to load site data from server");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAccent = (hex: string, autoSave: boolean = false) => {
    if (!isValidHexColor(hex)) {
      toast.error("Invalid HEX color format (must be #RGB or #RRGGBB)");
      return;
    }
    const cleanHex = hex.trim();
    setAccentColorInput(cleanHex);
    applyAccentColor(cleanHex);
    const updatedProfile = { ...profile, accentColor: cleanHex };
    setProfile(updatedProfile);
    if (autoSave) {
      handleSaveAll({ posts, projects, skills, profile: updatedProfile });
      toast.success(`OK: Accent color set to ${cleanHex} and persisted to disk`);
    } else {
      toast.info(`LIVE PREVIEW: Accent set to ${cleanHex}. Click [SAVE ACCENT TO DISK] to persist.`);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Handle Authentication
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === DEFAULT_AUTH_KEY || passwordInput.trim() === "admin") {
      setIsAuthenticated(true);
      sessionStorage.setItem("jurekdev_admin_auth", "true");
      toast.success("ROOT ACCESS GRANTED: Session verified");
    } else {
      toast.error("AUTH ERROR: Invalid security passkey (Default: jurek2026)");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("jurekdev_admin_auth");
    toast.info("SESSION TERMINATED: Signed out");
  };

  // Save all changes to server
  const handleSaveAll = async (overrideData?: SiteData) => {
    try {
      setSaving(true);
      const payload: SiteData = overrideData || {
        posts,
        projects,
        skills,
        profile,
      };

      const res = await fetch("/api/admin/data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorJson = await res.json();
        throw new Error(errorJson.error || "Save failed");
      }

      setRawJsonText(JSON.stringify(payload, null, 2));
      toast.success("OK: Saved all changes directly to server disk (/src/data/db.json)");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "ERR: Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  // --- BLOG POST HELPERS ---
  const handleSavePost = () => {
    if (!editingPost) return;
    if (!editingPost.title.trim()) {
      toast.error("Post title cannot be empty");
      return;
    }
    const slug = editingPost.slug.trim() || editingPost.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const updatedPost = { ...editingPost, slug };

    let nextPosts: BlogPost[];
    if (isCreatingPost) {
      nextPosts = [updatedPost, ...posts];
    } else {
      nextPosts = posts.map((p) => (p.slug === editingPost.slug ? updatedPost : p));
    }

    setPosts(nextPosts);
    setEditingPost(null);
    setIsCreatingPost(false);
    handleSaveAll({ posts: nextPosts, projects, skills, profile });
    toast.success(`OK: Post "${updatedPost.title}" saved`);
  };

  const handleDeletePost = (slug: string) => {
    if (!confirm(`Are you sure you want to delete post "${slug}"?`)) return;
    const nextPosts = posts.filter((p) => p.slug !== slug);
    setPosts(nextPosts);
    if (editingPost?.slug === slug) setEditingPost(null);
    handleSaveAll({ posts: nextPosts, projects, skills, profile });
    toast.success(`OK: Post "${slug}" deleted`);
  };

  // --- PROJECT HELPERS ---
  const handleSaveProject = () => {
    if (!editingProject) return;
    if (!editingProject.title.trim()) {
      toast.error("Project title cannot be empty");
      return;
    }
    const id = editingProject.id.trim() || editingProject.title.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const updatedProject = { ...editingProject, id, slug: id };

    let nextProjects: Project[];
    if (isCreatingProject) {
      nextProjects = [updatedProject, ...projects];
    } else {
      nextProjects = projects.map((p) => (p.id === editingProject.id ? updatedProject : p));
    }

    setProjects(nextProjects);
    setEditingProject(null);
    setIsCreatingProject(false);
    handleSaveAll({ posts, projects: nextProjects, skills, profile });
    toast.success(`OK: Project "${updatedProject.title}" saved`);
  };

  const handleDeleteProject = (id: string) => {
    if (!confirm(`Are you sure you want to delete project "${id}"?`)) return;
    const nextProjects = projects.filter((p) => p.id !== id);
    setProjects(nextProjects);
    if (editingProject?.id === id) setEditingProject(null);
    handleSaveAll({ posts, projects: nextProjects, skills, profile });
    toast.success(`OK: Project "${id}" deleted`);
  };

  const handleToggleFeatured = (id: string) => {
    const nextProjects = projects.map((p) => (p.id === id ? { ...p, featured: !p.featured } : p));
    setProjects(nextProjects);
    handleSaveAll({ posts, projects: nextProjects, skills, profile });
  };

  // --- DEV STACK / SKILLS HELPERS ---
  const handleCreateSkill = () => {
    setEditingSkill({
      name: "",
      category: "Systems & OS Tooling",
      proficiency: "Expert",
      description: "",
      tag: "",
    });
    setEditingSkillIndex(null);
    setIsCreatingSkill(true);
  };

  const handleEditSkill = (index: number) => {
    setEditingSkillIndex(index);
    setEditingSkill({ ...skills[index] });
    setIsCreatingSkill(false);
  };

  const handleSaveSkill = () => {
    if (!editingSkill) return;
    if (!editingSkill.name.trim()) {
      toast.error("Skill name cannot be empty");
      return;
    }
    if (!editingSkill.category.trim()) {
      toast.error("Category cannot be empty");
      return;
    }
    if (!editingSkill.description.trim()) {
      toast.error("Description cannot be empty");
      return;
    }

    let nextSkills: TechItem[];
    if (isCreatingSkill || editingSkillIndex === null) {
      nextSkills = [editingSkill, ...skills];
    } else {
      nextSkills = [...skills];
      nextSkills[editingSkillIndex] = editingSkill;
    }

    setSkills(nextSkills);
    setEditingSkill(null);
    setEditingSkillIndex(null);
    setIsCreatingSkill(false);
    handleSaveAll({ posts, projects, skills: nextSkills, profile });
    toast.success(`OK: Skill [${editingSkill.name}] saved`);
  };

  const handleDeleteSkill = (index: number) => {
    const target = skills[index];
    if (!target) return;
    if (!confirm(`Are you sure you want to delete skill [${target.name}]?`)) return;
    const nextSkills = skills.filter((_, i) => i !== index);
    setSkills(nextSkills);
    handleSaveAll({ posts, projects, skills: nextSkills, profile });
    toast.info(`DELETED: Skill [${target.name}] removed`);
  };

  const handleDuplicateSkill = (index: number) => {
    const target = skills[index];
    if (!target) return;
    const duplicated: TechItem = {
      ...target,
      name: `${target.name} (Copy)`,
    };
    const nextSkills = [...skills];
    nextSkills.splice(index + 1, 0, duplicated);
    setSkills(nextSkills);
    handleSaveAll({ posts, projects, skills: nextSkills, profile });
    toast.success(`DUPLICATED: Skill [${target.name}] copied`);
  };

  const handleMoveSkill = (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= skills.length) return;
    const nextSkills = [...skills];
    const [removed] = nextSkills.splice(index, 1);
    nextSkills.splice(targetIndex, 0, removed);
    setSkills(nextSkills);
    handleSaveAll({ posts, projects, skills: nextSkills, profile });
    toast.success(`REORDERED: [${removed.name}] moved ${direction}`);
  };

  const filteredSkillsList = useMemo(() => {
    return skills.filter((skill) => {
      const matchesCategory =
        selectedSkillCategory === "ALL" || skill.category === selectedSkillCategory;
      const matchesSearch =
        !skillSearch.trim() ||
        skill.name.toLowerCase().includes(skillSearch.toLowerCase()) ||
        skill.description.toLowerCase().includes(skillSearch.toLowerCase()) ||
        (skill.tag && skill.tag.toLowerCase().includes(skillSearch.toLowerCase())) ||
        skill.category.toLowerCase().includes(skillSearch.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [skills, selectedSkillCategory, skillSearch]);

  // --- RAW JSON IMPORT / EXPORT ---
  const handleApplyRawJson = () => {
    try {
      const parsed = JSON.parse(rawJsonText);
      if (!Array.isArray(parsed.posts) || !Array.isArray(parsed.projects)) {
        throw new Error("JSON must contain 'posts' and 'projects' arrays.");
      }
      setPosts(parsed.posts);
      setProjects(parsed.projects);
      if (Array.isArray(parsed.skills)) setSkills(parsed.skills);
      if (parsed.profile) setProfile(parsed.profile);
      handleSaveAll(parsed);
      toast.success("OK: Raw JSON database parsed and synced to disk");
    } catch (err) {
      toast.error(`JSON ERROR: ${err instanceof Error ? err.message : "Invalid JSON syntax"}`);
    }
  };

  const handleExportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ posts, projects, skills, profile }, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `jurekdev-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success("OK: Exported JSON backup");
  };

  const handleImportJsonFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (!Array.isArray(parsed.posts) || !Array.isArray(parsed.projects)) {
          throw new Error("Uploaded file is missing posts or projects array");
        }
        setPosts(parsed.posts);
        setProjects(parsed.projects);
        if (Array.isArray(parsed.skills)) setSkills(parsed.skills);
        if (parsed.profile) setProfile(parsed.profile);
        setRawJsonText(JSON.stringify(parsed, null, 2));
        handleSaveAll(parsed);
        toast.success(`OK: Imported ${parsed.posts.length} posts, ${parsed.projects.length} projects, ${(parsed.skills || []).length} skills`);
      } catch (err) {
        toast.error(`IMPORT FAILED: ${err instanceof Error ? err.message : "Malformed JSON"}`);
      }
    };
    reader.readAsText(file);
  };

  // ----------------------------------------------------
  // LOGIN SCREEN
  // ----------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="py-20 font-mono text-[#e5e5e5] max-w-md mx-auto">
        <div className="border border-[#e5e5e5] bg-[#000000] p-6 space-y-4">
          <div className="border-b border-[#e5e5e5] pb-2 flex items-center justify-between">
            <span className="text-[#38bdf8] font-bold text-xs">ROOT ACCESS SECURITY GATE</span>
            <span className="text-[10px] text-[#e5e5e5]">[AUTH: REQ]</span>
          </div>

          <p className="text-xs text-[#e5e5e5] leading-relaxed">
            Enter administrative root passkey to manage blog articles, projects, telemetry, and system variables.
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[11px] text-[#38bdf8]">ACCESS_KEY&gt;</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Default: jurek2026"
                className="w-full border border-[#e5e5e5] bg-[#000000] p-2 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
                autoFocus
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Link href="/" className="text-xs text-[#e5e5e5] hover:text-[#38bdf8]">
                [&lt; CANCEL]
              </Link>
              <SpotlightButton variant="primary" size="sm" type="submit">
                AUTHENTICATE ↵
              </SpotlightButton>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // ADMIN DASHBOARD
  // ----------------------------------------------------
  return (
    <div className="py-8 font-mono text-[#e5e5e5] space-y-6">
      {/* Top Status Header */}
      <div className="border border-[#e5e5e5] bg-[#000000] p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-[#38bdf8] text-[#000000] px-1.5 py-0.5 font-bold">
            [ROOT@jurekdev.qzz.io]
          </span>
          <span className="text-[#38bdf8]">MODE: SYSTEM_ADMIN</span>
          <span>|</span>
          <span className="text-[#e5e5e5]">POSTS: {posts.length} · PROJ: {projects.length} · SKILLS: {skills.length}</span>
          <span>|</span>
          <div className="flex items-center gap-1.5 border border-[#e5e5e5] px-2 py-0.5">
            <span className="text-[10px] text-[#e5e5e5]/70">ACCENT:</span>
            <span
              className="w-2.5 h-2.5 inline-block border border-[#e5e5e5]"
              style={{ backgroundColor: accentColorInput }}
            />
            <span className="font-bold text-[#38bdf8]">{accentColorInput.toUpperCase()}</span>
            <button
              onClick={() => setActiveTab("theme")}
              className="text-[10px] text-[#e5e5e5] hover:text-[#38bdf8] underline cursor-pointer ml-1"
            >
              [PALETTE]
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSaveAll()}
            disabled={saving}
            className="border border-[#38bdf8] bg-[#38bdf8] text-[#000000] font-bold px-2 py-1 text-xs hover:bg-[#000000] hover:text-[#38bdf8] cursor-pointer disabled:opacity-50"
          >
            {saving ? "[SAVING...]" : "[SAVE DISK ↵]"}
          </button>
          <Link
            href="/"
            className="border border-[#e5e5e5] px-2 py-1 text-xs text-[#e5e5e5] hover:border-[#38bdf8] hover:text-[#38bdf8]"
          >
            [VIEW SITE ↗]
          </Link>
          <button
            onClick={handleLogout}
            className="border border-[#e5e5e5] px-2 py-1 text-xs text-[#e5e5e5] hover:border-red-500 hover:text-red-400 cursor-pointer"
          >
            [EXIT]
          </button>
        </div>
      </div>

      {/* Main Tab Controls */}
      <div className="flex flex-wrap gap-2 text-xs border-b border-[#e5e5e5] pb-2">
        <button
          onClick={() => setActiveTab("posts")}
          className={`px-3 py-1.5 border cursor-pointer font-bold ${
            activeTab === "posts"
              ? "border-[#38bdf8] bg-[#38bdf8] text-[#000000]"
              : "border-[#e5e5e5] bg-[#000000] text-[#e5e5e5] hover:border-[#38bdf8]"
          }`}
        >
          [01: BLOG_ARTICLES ({posts.length})]
        </button>

        <button
          onClick={() => setActiveTab("projects")}
          className={`px-3 py-1.5 border cursor-pointer font-bold ${
            activeTab === "projects"
              ? "border-[#38bdf8] bg-[#38bdf8] text-[#000000]"
              : "border-[#e5e5e5] bg-[#000000] text-[#e5e5e5] hover:border-[#38bdf8]"
          }`}
        >
          [02: PROJECTS_SHOWCASE ({projects.length})]
        </button>

        <button
          onClick={() => setActiveTab("skills")}
          className={`px-3 py-1.5 border cursor-pointer font-bold ${
            activeTab === "skills"
              ? "border-[#38bdf8] bg-[#38bdf8] text-[#000000]"
              : "border-[#e5e5e5] bg-[#000000] text-[#e5e5e5] hover:border-[#38bdf8]"
          }`}
        >
          [03: DEV_STACK ({skills.length})]
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`px-3 py-1.5 border cursor-pointer font-bold ${
            activeTab === "profile"
              ? "border-[#38bdf8] bg-[#38bdf8] text-[#000000]"
              : "border-[#e5e5e5] bg-[#000000] text-[#e5e5e5] hover:border-[#38bdf8]"
          }`}
        >
          [04: SYSTEM_PROFILE]
        </button>

        <button
          onClick={() => setActiveTab("theme")}
          className={`px-3 py-1.5 border cursor-pointer font-bold flex items-center gap-1.5 ${
            activeTab === "theme"
              ? "border-[#38bdf8] bg-[#38bdf8] text-[#000000]"
              : "border-[#e5e5e5] bg-[#000000] text-[#e5e5e5] hover:border-[#38bdf8]"
          }`}
        >
          <span>[05: ACCENT_THEME</span>
          <span
            className="w-2.5 h-2.5 inline-block border border-current"
            style={{ backgroundColor: accentColorInput }}
          />
          <span>]</span>
        </button>

        <button
          onClick={() => {
            setActiveTab("raw_json");
            setRawJsonText(JSON.stringify({ posts, projects, skills, profile }, null, 2));
          }}
          className={`px-3 py-1.5 border cursor-pointer font-bold ${
            activeTab === "raw_json"
              ? "border-[#38bdf8] bg-[#38bdf8] text-[#000000]"
              : "border-[#e5e5e5] bg-[#000000] text-[#e5e5e5] hover:border-[#38bdf8]"
          }`}
        >
          [06: RAW_JSON_DATABASE]
        </button>
      </div>

      {loading && (
        <div className="py-12 text-center text-xs text-[#38bdf8]">
          [SYNCING DATA WITH SERVER DISK...]
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 1: BLOG ARTICLES MANAGER */}
      {/* ======================================================== */}
      {!loading && activeTab === "posts" && (
        <div className="space-y-6">
          {!editingPost ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#38bdf8] font-bold">
                  === ALL PUBLISHED &amp; DRAFT ARTICLES ===
                </span>
                <button
                  onClick={() => {
                    setEditingPost({
                      slug: "",
                      title: "",
                      description: "",
                      publishedAt: new Date().toISOString().slice(0, 10),
                      readingTime: "5 min read",
                      category: "Systems & Engineering",
                      tags: ["Go", "Systems"],
                      author: { name: profile.name, handle: profile.handle },
                      content: "## Overview\n\nWrite article content here...",
                      toc: [],
                    });
                    setIsCreatingPost(true);
                  }}
                  className="border border-[#38bdf8] bg-[#000000] px-3 py-1 text-xs text-[#38bdf8] hover:bg-[#38bdf8] hover:text-[#000000] cursor-pointer"
                >
                  [+ CREATE NEW ARTICLE]
                </button>
              </div>

              <div className="border border-[#e5e5e5] divide-y divide-[#e5e5e5]">
                {posts.map((post) => (
                  <div key={post.slug} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-[#38bdf8]/5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#e5e5e5] text-[#000000] px-1 font-bold text-[10px]">
                          {post.category}
                        </span>
                        <span className="font-bold text-[#e5e5e5]">{post.title}</span>
                      </div>
                      <div className="text-[11px] text-[#38bdf8]">
                        /blog/{post.slug} · [{post.publishedAt}] · {post.readingTime}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="border border-[#e5e5e5] px-2 py-0.5 text-[11px] text-[#e5e5e5] hover:border-[#38bdf8] hover:text-[#38bdf8]"
                      >
                        [VIEW ↗]
                      </Link>
                      <button
                        onClick={() => {
                          setEditingPost({ ...post });
                          setIsCreatingPost(false);
                        }}
                        className="border border-[#38bdf8] px-2 py-0.5 text-[11px] text-[#38bdf8] hover:bg-[#38bdf8] hover:text-[#000000] cursor-pointer"
                      >
                        [EDIT]
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.slug)}
                        className="border border-red-500 px-2 py-0.5 text-[11px] text-red-400 hover:bg-red-500 hover:text-[#000000] cursor-pointer"
                      >
                        [DEL]
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* POST EDITOR */
            <div className="border border-[#e5e5e5] p-4 bg-[#000000] space-y-4">
              <div className="border-b border-[#e5e5e5] pb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-[#38bdf8]">
                  {isCreatingPost ? "=== CREATE NEW ARTICLE ===" : `=== EDIT ARTICLE: ${editingPost.title} ===`}
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => setPostPreviewMode(!postPreviewMode)}
                    className="border border-[#e5e5e5] px-2 py-0.5 text-[11px] text-[#e5e5e5] hover:border-[#38bdf8] hover:text-[#38bdf8]"
                  >
                    [{postPreviewMode ? "SWITCH TO EDITOR" : "PREVIEW MARKDOWN"}]
                  </button>
                  <button
                    onClick={() => setEditingPost(null)}
                    className="border border-[#e5e5e5] px-2 py-0.5 text-[11px] text-[#e5e5e5] hover:border-red-400 hover:text-red-400"
                  >
                    [CANCEL]
                  </button>
                </div>
              </div>

              {!postPreviewMode ? (
                <div className="space-y-3 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[#38bdf8] block mb-1">TITLE</label>
                      <input
                        type="text"
                        value={editingPost.title}
                        onChange={(e) => {
                          const title = e.target.value;
                          setEditingPost({
                            ...editingPost,
                            title,
                            slug: isCreatingPost ? title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : editingPost.slug,
                          });
                        }}
                        className="w-full border border-[#e5e5e5] bg-[#000000] p-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
                        placeholder="Article Headline..."
                      />
                    </div>

                    <div>
                      <label className="text-[#38bdf8] block mb-1">SLUG (URL IDENTIFIER)</label>
                      <input
                        type="text"
                        value={editingPost.slug}
                        onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                        className="w-full border border-[#e5e5e5] bg-[#000000] p-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
                        placeholder="article-slug-identifier"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="text-[#38bdf8] block mb-1">CATEGORY</label>
                      <input
                        type="text"
                        value={editingPost.category}
                        onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                        className="w-full border border-[#e5e5e5] bg-[#000000] p-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
                      />
                    </div>

                    <div>
                      <label className="text-[#38bdf8] block mb-1">PUBLISHED DATE</label>
                      <input
                        type="text"
                        value={editingPost.publishedAt}
                        onChange={(e) => setEditingPost({ ...editingPost, publishedAt: e.target.value })}
                        className="w-full border border-[#e5e5e5] bg-[#000000] p-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
                        placeholder="YYYY-MM-DD"
                      />
                    </div>

                    <div>
                      <label className="text-[#38bdf8] block mb-1">READING TIME</label>
                      <input
                        type="text"
                        value={editingPost.readingTime}
                        onChange={(e) => setEditingPost({ ...editingPost, readingTime: e.target.value })}
                        className="w-full border border-[#e5e5e5] bg-[#000000] p-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[#38bdf8] block mb-1">TAGS (COMMA-SEPARATED)</label>
                    <input
                      type="text"
                      value={editingPost.tags?.join(", ") || ""}
                      onChange={(e) =>
                        setEditingPost({
                          ...editingPost,
                          tags: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                        })
                      }
                      className="w-full border border-[#e5e5e5] bg-[#000000] p-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
                      placeholder="Go, Raft, Systems, Performance"
                    />
                  </div>

                  <div>
                    <label className="text-[#38bdf8] block mb-1">SHORT DESCRIPTION / TEASER</label>
                    <textarea
                      value={editingPost.description}
                      onChange={(e) => setEditingPost({ ...editingPost, description: e.target.value })}
                      rows={2}
                      className="w-full border border-[#e5e5e5] bg-[#000000] p-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
                    />
                  </div>

                  {/* Markdown Editor */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[#38bdf8]">MARKDOWN CONTENT</label>
                      <div className="flex gap-1 text-[10px]">
                        <button
                          type="button"
                          onClick={() => setEditingPost({ ...editingPost, content: editingPost.content + "\n\n## Section Heading\n\n" })}
                          className="border border-[#e5e5e5] px-1 text-[#e5e5e5] hover:text-[#38bdf8]"
                        >
                          +H2
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingPost({ ...editingPost, content: editingPost.content + "\n\n```go\nfunc main() {\n    // Code here\n}\n```\n\n" })}
                          className="border border-[#e5e5e5] px-1 text-[#e5e5e5] hover:text-[#38bdf8]"
                        >
                          +Go Code
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingPost({ ...editingPost, content: editingPost.content + "\n\n> [!NOTE]\n> Key technical highlight here.\n\n" })}
                          className="border border-[#e5e5e5] px-1 text-[#e5e5e5] hover:text-[#38bdf8]"
                        >
                          +Callout
                        </button>
                      </div>
                    </div>
                    <textarea
                      value={editingPost.content}
                      onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                      rows={14}
                      className="w-full border border-[#e5e5e5] bg-[#000000] p-2 text-xs text-[#e5e5e5] font-mono outline-none focus:border-[#38bdf8]"
                    />
                  </div>
                </div>
              ) : (
                /* MARKDOWN PREVIEW */
                <div className="border border-[#e5e5e5] p-4 bg-[#000000] space-y-4 max-h-[500px] overflow-y-auto">
                  <h1 className="text-lg font-bold text-[#38bdf8] uppercase">{editingPost.title}</h1>
                  <p className="text-xs opacity-80">{editingPost.description}</p>
                  <pre className="whitespace-pre-wrap text-xs text-[#e5e5e5] font-mono leading-relaxed bg-[#000000] border border-[#e5e5e5]/40 p-3">
                    {editingPost.content}
                  </pre>
                </div>
              )}

              <div className="pt-2 border-t border-[#e5e5e5] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setEditingPost(null)}
                  className="border border-[#e5e5e5] px-3 py-1 text-xs text-[#e5e5e5] hover:border-red-400 hover:text-red-400"
                >
                  [DISCARD]
                </button>
                <button
                  type="button"
                  onClick={handleSavePost}
                  className="border border-[#38bdf8] bg-[#38bdf8] text-[#000000] font-bold px-3 py-1 text-xs hover:bg-[#000000] hover:text-[#38bdf8] cursor-pointer"
                >
                  [SAVE POST ↵]
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 2: PROJECTS SHOWCASE MANAGER */}
      {/* ======================================================== */}
      {!loading && activeTab === "projects" && (
        <div className="space-y-6">
          {!editingProject ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#38bdf8] font-bold">
                  === ALL PORTFOLIO PROJECTS ===
                </span>
                <button
                  onClick={() => {
                    setEditingProject({
                      id: "",
                      slug: "",
                      title: "",
                      tagline: "",
                      description: "",
                      category: "systems",
                      techStack: ["Go", "CLI"],
                      githubUrl: `https://github.com/${profile.handle}/`,
                      stars: 0,
                      forks: 0,
                      featured: false,
                      highlights: ["Production-ready architecture"],
                      metrics: [{ label: "Language", value: "Go" }],
                    });
                    setIsCreatingProject(true);
                  }}
                  className="border border-[#38bdf8] bg-[#000000] px-3 py-1 text-xs text-[#38bdf8] hover:bg-[#38bdf8] hover:text-[#000000] cursor-pointer"
                >
                  [+ CREATE NEW PROJECT]
                </button>
              </div>

              <div className="border border-[#e5e5e5] divide-y divide-[#e5e5e5]">
                {projects.map((proj) => (
                  <div key={proj.id} className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-[#38bdf8]/5">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="bg-[#38bdf8] text-[#000000] px-1 font-bold text-[10px]">
                          {proj.category.toUpperCase()}
                        </span>
                        <span className="font-bold text-[#e5e5e5]">{proj.title}</span>
                        {proj.featured && (
                          <span className="border border-[#38bdf8] text-[#38bdf8] text-[9px] px-1 font-bold">
                            FEATURED ★
                          </span>
                        )}
                        {proj.stars !== undefined && proj.stars > 0 && (
                          <span className="text-[#38bdf8] text-[10px]">★ {proj.stars}</span>
                        )}
                      </div>
                      <div className="text-[11px] text-[#e5e5e5]/80">
                        // {proj.tagline}
                      </div>
                      <div className="text-[10px] text-[#38bdf8]">
                        [{proj.techStack.join(" · ")}]
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleToggleFeatured(proj.id)}
                        className={`border px-2 py-0.5 text-[11px] cursor-pointer ${
                          proj.featured
                            ? "border-[#38bdf8] bg-[#38bdf8] text-[#000000] font-bold"
                            : "border-[#e5e5e5] text-[#e5e5e5] hover:border-[#38bdf8]"
                        }`}
                        title="Toggle featured spotlight status"
                      >
                        [{proj.featured ? "FEATURED ★" : "SET FEATURED"}]
                      </button>
                      <button
                        onClick={() => {
                          setEditingProject({ ...proj });
                          setIsCreatingProject(false);
                        }}
                        className="border border-[#38bdf8] px-2 py-0.5 text-[11px] text-[#38bdf8] hover:bg-[#38bdf8] hover:text-[#000000] cursor-pointer"
                      >
                        [EDIT]
                      </button>
                      <button
                        onClick={() => handleDeleteProject(proj.id)}
                        className="border border-red-500 px-2 py-0.5 text-[11px] text-red-400 hover:bg-red-500 hover:text-[#000000] cursor-pointer"
                      >
                        [DEL]
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* PROJECT EDITOR */
            <div className="border border-[#e5e5e5] p-4 bg-[#000000] space-y-4">
              <div className="border-b border-[#e5e5e5] pb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-[#38bdf8]">
                  {isCreatingProject ? "=== CREATE NEW PROJECT ===" : `=== EDIT PROJECT: ${editingProject.title} ===`}
                </span>
                <button
                  onClick={() => setEditingProject(null)}
                  className="border border-[#e5e5e5] px-2 py-0.5 text-[11px] text-[#e5e5e5] hover:border-red-400 hover:text-red-400"
                >
                  [CANCEL]
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#38bdf8] block mb-1">PROJECT TITLE</label>
                    <input
                      type="text"
                      value={editingProject.title}
                      onChange={(e) => {
                        const title = e.target.value;
                        setEditingProject({
                          ...editingProject,
                          title,
                          id: isCreatingProject ? title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") : editingProject.id,
                        });
                      }}
                      className="w-full border border-[#e5e5e5] bg-[#000000] p-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
                    />
                  </div>

                  <div>
                    <label className="text-[#38bdf8] block mb-1">PROJECT ID / SLUG</label>
                    <input
                      type="text"
                      value={editingProject.id}
                      onChange={(e) => setEditingProject({ ...editingProject, id: e.target.value })}
                      className="w-full border border-[#e5e5e5] bg-[#000000] p-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[#38bdf8] block mb-1">TAGLINE / ONE-LINER</label>
                  <input
                    type="text"
                    value={editingProject.tagline}
                    onChange={(e) => setEditingProject({ ...editingProject, tagline: e.target.value })}
                    className="w-full border border-[#e5e5e5] bg-[#000000] p-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[#38bdf8] block mb-1">CATEGORY</label>
                    <select
                      value={editingProject.category}
                      onChange={(e) => setEditingProject({ ...editingProject, category: e.target.value as "systems" | "fullstack" | "opensource" | "experiments" })}
                      className="w-full border border-[#e5e5e5] bg-[#000000] p-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
                    >
                      <option value="systems">SYSTEMS &amp; GO</option>
                      <option value="fullstack">FULLSTACK</option>
                      <option value="opensource">OPEN SOURCE</option>
                      <option value="experiments">EXPERIMENTS</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[#38bdf8] block mb-1">STARS COUNT</label>
                    <input
                      type="number"
                      value={editingProject.stars || 0}
                      onChange={(e) => setEditingProject({ ...editingProject, stars: parseInt(e.target.value) || 0 })}
                      className="w-full border border-[#e5e5e5] bg-[#000000] p-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
                    />
                  </div>

                  <div className="flex items-center pt-5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={editingProject.featured}
                        onChange={(e) => setEditingProject({ ...editingProject, featured: e.target.checked })}
                        className="accent-[#38bdf8]"
                      />
                      <span className="text-[#38bdf8] font-bold">[FEATURED SPOTLIGHT]</span>
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#38bdf8] block mb-1">GITHUB REPO URL</label>
                    <input
                      type="text"
                      value={editingProject.githubUrl}
                      onChange={(e) => setEditingProject({ ...editingProject, githubUrl: e.target.value })}
                      className="w-full border border-[#e5e5e5] bg-[#000000] p-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
                    />
                  </div>

                  <div>
                    <label className="text-[#38bdf8] block mb-1">LIVE DEMO / SPEC URL (OPTIONAL)</label>
                    <input
                      type="text"
                      value={editingProject.liveUrl || ""}
                      onChange={(e) => setEditingProject({ ...editingProject, liveUrl: e.target.value })}
                      className="w-full border border-[#e5e5e5] bg-[#000000] p-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[#38bdf8] block mb-1">TECH STACK (COMMA-SEPARATED)</label>
                  <input
                    type="text"
                    value={editingProject.techStack.join(", ")}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        techStack: e.target.value.split(",").map((s) => s.trim()).filter(Boolean),
                      })
                    }
                    className="w-full border border-[#e5e5e5] bg-[#000000] p-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
                  />
                </div>

                <div>
                  <label className="text-[#38bdf8] block mb-1">DESCRIPTION</label>
                  <textarea
                    value={editingProject.description}
                    onChange={(e) => setEditingProject({ ...editingProject, description: e.target.value })}
                    rows={3}
                    className="w-full border border-[#e5e5e5] bg-[#000000] p-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
                  />
                </div>

                <div>
                  <label className="text-[#38bdf8] block mb-1">HIGHLIGHTS (ONE PER LINE)</label>
                  <textarea
                    value={editingProject.highlights.join("\n")}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        highlights: e.target.value.split("\n").filter(Boolean),
                      })
                    }
                    rows={3}
                    className="w-full border border-[#e5e5e5] bg-[#000000] p-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
                  />
                </div>

                <div>
                  <label className="text-[#38bdf8] block mb-1">ARCHITECTURE BENCHMARK / NOTES</label>
                  <input
                    type="text"
                    value={editingProject.architecture?.benchmark || ""}
                    onChange={(e) =>
                      setEditingProject({
                        ...editingProject,
                        architecture: {
                          overview: editingProject.architecture?.overview || editingProject.description,
                          keyDecisions: editingProject.architecture?.keyDecisions || [],
                          benchmark: e.target.value,
                        },
                      })
                    }
                    className="w-full border border-[#e5e5e5] bg-[#000000] p-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
                    placeholder="Saturates 10Gbps uplink with 0.8% CPU utilization"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#e5e5e5] flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setEditingProject(null)}
                  className="border border-[#e5e5e5] px-3 py-1 text-xs text-[#e5e5e5] hover:border-red-400 hover:text-red-400"
                >
                  [DISCARD]
                </button>
                <button
                  type="button"
                  onClick={handleSaveProject}
                  className="border border-[#38bdf8] bg-[#38bdf8] text-[#000000] font-bold px-3 py-1 text-xs hover:bg-[#000000] hover:text-[#38bdf8] cursor-pointer"
                >
                  [SAVE PROJECT ↵]
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 3: DEV STACK & MULTIDISCIPLINARY SKILLS */}
      {/* ======================================================== */}
      {!loading && activeTab === "skills" && (
        <div className="space-y-6">
          {!editingSkill ? (
            <div className="space-y-4">
              {/* Header and Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#e5e5e5] pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#38bdf8] font-bold">
                      === DEV_STACK &amp; MULTIDISCIPLINARY SKILLS MATRIX ===
                    </span>
                    <span className="text-[10px] text-[#e5e5e5]">[{skills.length} TOTAL SKILLS]</span>
                  </div>
                  <div className="text-[11px] text-[#e5e5e5]">
                    Manage technologies, proficiencies, descriptions, and proof tags rendered in Telemetry Pane 03
                  </div>
                </div>

                <button
                  onClick={handleCreateSkill}
                  className="border border-[#38bdf8] bg-[#000000] px-3 py-1.5 text-xs text-[#38bdf8] hover:bg-[#38bdf8] hover:text-[#000000] cursor-pointer font-bold shrink-0"
                >
                  [+ NEW DEV SKILL]
                </button>
              </div>

              {/* Filters and Search Bar */}
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Filter skills by keyword (e.g. Go, macOS, WebSockets, Canvas)..."
                  value={skillSearch}
                  onChange={(e) => setSkillSearch(e.target.value)}
                  className="flex-1 border border-[#e5e5e5] bg-[#000000] px-2.5 py-1 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
                />
                {skillSearch && (
                  <button
                    onClick={() => setSkillSearch("")}
                    className="border border-[#e5e5e5] px-2 py-1 text-xs hover:border-red-400 hover:text-red-400 cursor-pointer"
                  >
                    [CLEAR]
                  </button>
                )}
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1 text-[11px]">
                <button
                  onClick={() => setSelectedSkillCategory("ALL")}
                  className={`px-2 py-0.5 border cursor-pointer ${
                    selectedSkillCategory === "ALL"
                      ? "border-[#38bdf8] bg-[#38bdf8] text-[#000000] font-bold"
                      : "border-[#e5e5e5] bg-[#000000] text-[#e5e5e5] hover:border-[#38bdf8]"
                  }`}
                >
                  [ALL ({skills.length})]
                </button>
                {Array.from(new Set(skills.map((s) => s.category).filter(Boolean))).map((cat) => {
                  const count = skills.filter((s) => s.category === cat).length;
                  return (
                    <button
                      key={cat}
                      onClick={() => setSelectedSkillCategory(cat)}
                      className={`px-2 py-0.5 border cursor-pointer ${
                        selectedSkillCategory === cat
                          ? "border-[#38bdf8] bg-[#38bdf8] text-[#000000] font-bold"
                          : "border-[#e5e5e5] bg-[#000000] text-[#e5e5e5] hover:border-[#38bdf8]"
                      }`}
                    >
                      [{cat} ({count})]
                    </button>
                  );
                })}
              </div>

              {/* Skills List */}
              <div className="border border-[#e5e5e5] divide-y divide-[#e5e5e5]">
                {filteredSkillsList.length === 0 ? (
                  <div className="p-6 text-center text-xs text-[#e5e5e5]">
                    [NO SKILLS MATCH CURRENT FILTER OR SEARCH]
                  </div>
                ) : (
                  filteredSkillsList.map((skill, displayIdx) => {
                    const realIndex = skills.findIndex((s) => s === skill);
                    return (
                      <div
                        key={skill.name + displayIdx}
                        className="p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:bg-[#38bdf8]/5"
                      >
                        <div className="space-y-1 flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="bg-[#38bdf8] text-[#000000] px-1 font-bold text-[10px]">
                              {skill.category.toUpperCase()}
                            </span>
                            <span className="font-bold text-[#e5e5e5] text-sm">{skill.name}</span>
                            <span className="border border-[#e5e5e5] text-[10px] px-1 text-[#38bdf8]">
                              [{skill.proficiency}]
                            </span>
                            {skill.tag && (
                              <span className="text-[10px] text-[#e5e5e5]/80">
                                &gt; {skill.tag}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-[#e5e5e5] leading-relaxed">
                            {skill.description}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleMoveSkill(realIndex, "up")}
                            disabled={realIndex === 0}
                            className="border border-[#e5e5e5] px-1.5 py-0.5 text-[11px] text-[#e5e5e5] hover:border-[#38bdf8] hover:text-[#38bdf8] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Move skill up in list"
                          >
                            [↑]
                          </button>
                          <button
                            onClick={() => handleMoveSkill(realIndex, "down")}
                            disabled={realIndex === skills.length - 1}
                            className="border border-[#e5e5e5] px-1.5 py-0.5 text-[11px] text-[#e5e5e5] hover:border-[#38bdf8] hover:text-[#38bdf8] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                            title="Move skill down in list"
                          >
                            [↓]
                          </button>
                          <button
                            onClick={() => handleDuplicateSkill(realIndex)}
                            className="border border-[#e5e5e5] px-2 py-0.5 text-[11px] text-[#e5e5e5] hover:border-[#38bdf8] hover:text-[#38bdf8] cursor-pointer"
                          >
                            [COPY]
                          </button>
                          <button
                            onClick={() => handleEditSkill(realIndex)}
                            className="border border-[#38bdf8] px-2 py-0.5 text-[11px] text-[#38bdf8] hover:bg-[#38bdf8] hover:text-[#000000] cursor-pointer"
                          >
                            [EDIT]
                          </button>
                          <button
                            onClick={() => handleDeleteSkill(realIndex)}
                            className="border border-red-500 px-2 py-0.5 text-[11px] text-red-400 hover:bg-red-500 hover:text-[#000000] cursor-pointer"
                          >
                            [DEL]
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          ) : (
            /* SKILL EDITOR FORM */
            <div className="border border-[#e5e5e5] p-4 bg-[#000000] space-y-4">
              <div className="border-b border-[#e5e5e5] pb-2 flex items-center justify-between">
                <span className="text-xs font-bold text-[#38bdf8]">
                  {isCreatingSkill ? "=== CREATE NEW DEV SKILL ===" : `=== EDIT SKILL: ${editingSkill.name} ===`}
                </span>
                <button
                  onClick={() => {
                    setEditingSkill(null);
                    setEditingSkillIndex(null);
                    setIsCreatingSkill(false);
                  }}
                  className="border border-[#e5e5e5] px-2 py-0.5 text-[11px] text-[#e5e5e5] hover:border-red-400 hover:text-red-400 cursor-pointer"
                >
                  [CANCEL]
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#38bdf8] block mb-1">TECHNOLOGY / SKILL NAME *</label>
                    <input
                      type="text"
                      value={editingSkill.name}
                      onChange={(e) => setEditingSkill({ ...editingSkill, name: e.target.value })}
                      className="w-full border border-[#e5e5e5] bg-[#000000] p-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
                      placeholder="e.g. Go (CLI & TUI), Rust, Linux Kernel"
                      autoFocus
                    />
                  </div>

                  <div>
                    <label className="text-[#38bdf8] block mb-1">PROFICIENCY LEVEL</label>
                    <div className="flex gap-2">
                      {(["Expert", "Advanced", "Proficient"] as const).map((lvl) => (
                        <button
                          type="button"
                          key={lvl}
                          onClick={() => setEditingSkill({ ...editingSkill, proficiency: lvl })}
                          className={`flex-1 border py-1.5 text-xs cursor-pointer ${
                            editingSkill.proficiency === lvl
                              ? "border-[#38bdf8] bg-[#38bdf8] text-[#000000] font-bold"
                              : "border-[#e5e5e5] text-[#e5e5e5] hover:border-[#38bdf8]"
                          }`}
                        >
                          [{lvl.toUpperCase()}]
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="text-[#38bdf8] block mb-1">CATEGORY DOMAIN *</label>
                  <input
                    type="text"
                    value={editingSkill.category}
                    onChange={(e) => setEditingSkill({ ...editingSkill, category: e.target.value })}
                    className="w-full border border-[#e5e5e5] bg-[#000000] p-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
                    placeholder="e.g. Systems & OS Tooling"
                  />
                  <div className="mt-1.5 flex flex-wrap gap-1 text-[10px]">
                    <span className="text-[#e5e5e5]/80 py-0.5">PRESETS:</span>
                    {[
                      "Systems & OS Tooling",
                      "Game Dev & Real-Time",
                      "Browser Extensions & Automation",
                      "Desktop Modding & Theming",
                      "Fullstack & Cloud",
                      "Reverse Engineering & REA",
                      "Languages & Runtimes",
                    ].map((preset) => (
                      <button
                        type="button"
                        key={preset}
                        onClick={() => setEditingSkill({ ...editingSkill, category: preset })}
                        className="border border-[#e5e5e5]/40 px-1 py-0.5 text-[#38bdf8] hover:border-[#38bdf8] hover:bg-[#38bdf8]/10 cursor-pointer"
                      >
                        [{preset}]
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-[#38bdf8] block mb-1">FLAGSHIP REPOS / PROOF TAGS</label>
                  <input
                    type="text"
                    value={editingSkill.tag || ""}
                    onChange={(e) => setEditingSkill({ ...editingSkill, tag: e.target.value })}
                    className="w-full border border-[#e5e5e5] bg-[#000000] p-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
                    placeholder="e.g. ohio-cli, vellum, antiQuarantine"
                  />
                  <p className="text-[10px] text-[#e5e5e5]/80 mt-0.5">
                    Comma-separated list of projects or services that demonstrate this skill.
                  </p>
                </div>

                <div>
                  <label className="text-[#38bdf8] block mb-1">TECHNICAL DESCRIPTION &amp; LOW-LEVEL HIGHLIGHTS *</label>
                  <textarea
                    value={editingSkill.description}
                    onChange={(e) => setEditingSkill({ ...editingSkill, description: e.target.value })}
                    rows={3}
                    className="w-full border border-[#e5e5e5] bg-[#000000] p-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
                    placeholder="Describe concrete implementation details, low-level architecture, protocols, or capabilities..."
                  />
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="border-t border-[#e5e5e5] pt-3 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setEditingSkill(null);
                    setEditingSkillIndex(null);
                    setIsCreatingSkill(false);
                  }}
                  className="border border-[#e5e5e5] px-3 py-1 text-xs text-[#e5e5e5] hover:border-red-400 hover:text-red-400 cursor-pointer"
                >
                  [DISCARD]
                </button>
                <button
                  type="button"
                  onClick={handleSaveSkill}
                  className="border border-[#38bdf8] bg-[#38bdf8] text-[#000000] font-bold px-4 py-1 text-xs hover:bg-[#000000] hover:text-[#38bdf8] cursor-pointer"
                >
                  [SAVE SKILL &amp; PERSIST TO DISK ↵]
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 4: SYSTEM PROFILE & HERO TELEMETRY */}
      {/* ======================================================== */}
      {!loading && activeTab === "profile" && (
        <div className="border border-[#e5e5e5] p-4 bg-[#000000] space-y-4">
          <div className="border-b border-[#e5e5e5] pb-2 flex items-center justify-between">
            <span className="text-xs font-bold text-[#38bdf8]">
              === SYSTEM PROFILE &amp; IDENTITY TELEMETRY ===
            </span>
            <span className="text-[10px] text-[#e5e5e5]">[REALTIME SYNC]</span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[#38bdf8] block mb-1">USER FULL NAME</label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full border border-[#e5e5e5] bg-[#000000] p-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
                />
              </div>

              <div>
                <label className="text-[#38bdf8] block mb-1">GITHUB HANDLE</label>
                <input
                  type="text"
                  value={profile.handle}
                  onChange={(e) => setProfile({ ...profile, handle: e.target.value })}
                  className="w-full border border-[#e5e5e5] bg-[#000000] p-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-[#38bdf8] block mb-1">ROLE / TITLE</label>
                <input
                  type="text"
                  value={profile.role}
                  onChange={(e) => setProfile({ ...profile, role: e.target.value })}
                  className="w-full border border-[#e5e5e5] bg-[#000000] p-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
                />
              </div>

              <div>
                <label className="text-[#38bdf8] block mb-1">LOCATION</label>
                <input
                  type="text"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                  className="w-full border border-[#e5e5e5] bg-[#000000] p-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[#38bdf8] block mb-1">HOST DOMAIN</label>
                <input
                  type="text"
                  value={profile.host}
                  onChange={(e) => setProfile({ ...profile, host: e.target.value })}
                  className="w-full border border-[#e5e5e5] bg-[#000000] p-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
                />
              </div>

              <div>
                <label className="text-[#38bdf8] block mb-1">CONTACT EMAIL</label>
                <input
                  type="text"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full border border-[#e5e5e5] bg-[#000000] p-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
                />
              </div>
            </div>

            <div>
              <label className="text-[#38bdf8] block mb-1">ACCENT THEME COLOR (3RD PALETTE COLOR)</label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="color"
                  value={accentColorInput}
                  onChange={(e) => handleSelectAccent(e.target.value, false)}
                  className="w-7 h-7 cursor-pointer border border-[#e5e5e5] bg-transparent p-0"
                />
                <input
                  type="text"
                  value={accentColorInput}
                  onChange={(e) => handleSelectAccent(e.target.value, false)}
                  className="w-32 border border-[#e5e5e5] bg-[#000000] p-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8] uppercase font-bold"
                />
                <button
                  type="button"
                  onClick={() => setActiveTab("theme")}
                  className="border border-[#e5e5e5] px-2.5 py-1 text-xs text-[#e5e5e5] hover:border-[#38bdf8] hover:text-[#38bdf8]"
                >
                  [OPEN FULL PALETTE MANAGER ↵]
                </button>
              </div>
            </div>

            <div>
              <label className="text-[#38bdf8] block mb-1">STATUS BADGE</label>
              <input
                type="text"
                value={profile.status}
                onChange={(e) => setProfile({ ...profile, status: e.target.value })}
                className="w-full border border-[#e5e5e5] bg-[#000000] p-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
              />
            </div>

            <div>
              <label className="text-[#38bdf8] block mb-1">ECOSYSTEM / SERVICES</label>
              <input
                type="text"
                value={profile.ecosystem}
                onChange={(e) => setProfile({ ...profile, ecosystem: e.target.value })}
                className="w-full border border-[#e5e5e5] bg-[#000000] p-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
              />
            </div>

            <div>
              <label className="text-[#38bdf8] block mb-1">FLAGSHIP PROJECTS</label>
              <input
                type="text"
                value={profile.flagships}
                onChange={(e) => setProfile({ ...profile, flagships: e.target.value })}
                className="w-full border border-[#e5e5e5] bg-[#000000] p-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
              />
            </div>

            <div>
              <label className="text-[#38bdf8] block mb-1">BIO STATEMENT (HERO SUMMARY)</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={3}
                className="w-full border border-[#e5e5e5] bg-[#000000] p-1.5 text-xs text-[#e5e5e5] outline-none focus:border-[#38bdf8]"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-[#e5e5e5] flex justify-end">
            <button
              onClick={() => handleSaveAll()}
              disabled={saving}
              className="border border-[#38bdf8] bg-[#38bdf8] text-[#000000] font-bold px-3 py-1 text-xs hover:bg-[#000000] hover:text-[#38bdf8] cursor-pointer"
            >
              [SAVE PROFILE TO DISK ↵]
            </button>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 5: ACCENT COLOR THEME CONTROLLER */}
      {/* ======================================================== */}
      {!loading && activeTab === "theme" && (
        <div className="border border-[#e5e5e5] p-4 bg-[#000000] space-y-6">
          <div className="border-b border-[#e5e5e5] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-[#38bdf8]">
                  === ACCENT COLOR MATRIX &amp; TUI PALETTE CONTROLLER ===
                </span>
                <span
                  className="w-3.5 h-3.5 border border-[#e5e5e5] inline-block shrink-0"
                  style={{ backgroundColor: accentColorInput }}
                />
              </div>
              <p className="mt-1 text-[11px] text-[#e5e5e5]/80">
                Instantly switch the third color in the strict 3-color palette (#000000 bg, #e5e5e5 text/structure, plus your accent color). Real-time CSS variable binding applies instantly across every page and persists directly to server storage.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleSelectAccent(DEFAULT_ACCENT, true)}
                className="border border-[#e5e5e5] px-2.5 py-1 text-xs text-[#e5e5e5] hover:border-[#38bdf8] hover:text-[#38bdf8] cursor-pointer"
              >
                [RESET DEFAULT SKY]
              </button>
              <button
                onClick={() => handleSelectAccent(accentColorInput, true)}
                disabled={saving}
                className="border border-[#38bdf8] bg-[#38bdf8] text-[#000000] font-bold px-3 py-1 text-xs hover:bg-[#000000] hover:text-[#38bdf8] cursor-pointer"
              >
                {saving ? "[SAVING...]" : "[SAVE ACCENT TO DISK ↵]"}
              </button>
            </div>
          </div>

          {/* Active Accent Telemetry & Custom Picker */}
          <div className="border border-[#e5e5e5] p-3 bg-[#000000] space-y-3">
            <div className="text-[11px] font-bold text-[#38bdf8]">
              -- SECTION A: CUSTOM COLOR SELECTOR &amp; TELEMETRY --
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 border-2 border-[#e5e5e5] shrink-0 flex items-center justify-center text-xs font-bold shadow-inner"
                  style={{ backgroundColor: accentColorInput }}
                >
                  <span className="bg-[#000000] text-[#e5e5e5] px-1 py-0.5 text-[9px] opacity-80">
                    HEX
                  </span>
                </div>

                <div className="space-y-1">
                  <div className="text-xs">
                    ACTIVE_HEX: <span className="font-bold text-[#38bdf8]">{accentColorInput.toUpperCase()}</span>
                  </div>
                  <div className="text-[10px] text-[#e5e5e5]/70">
                    STATUS: {ACCENT_PRESETS.find((p) => p.hex.toLowerCase() === accentColorInput.toLowerCase())?.name || "CUSTOM_USER_HEX"}
                  </div>
                </div>
              </div>

              {/* Native picker + Hex Input */}
              <div className="flex flex-wrap items-center gap-2 pt-2 sm:pt-0 sm:border-l sm:border-[#e5e5e5] sm:pl-4">
                <label className="border border-[#e5e5e5] px-2.5 py-1.5 text-xs text-[#e5e5e5] hover:border-[#38bdf8] hover:text-[#38bdf8] cursor-pointer flex items-center gap-2">
                  <span>[PICK COLOR]</span>
                  <input
                    type="color"
                    value={accentColorInput}
                    onChange={(e) => handleSelectAccent(e.target.value, false)}
                    className="w-4 h-4 cursor-pointer bg-transparent border-0 p-0"
                  />
                </label>

                <div className="flex items-center border border-[#e5e5e5] px-2 py-1 text-xs">
                  <span className="text-[#38bdf8] mr-1">#</span>
                  <input
                    type="text"
                    value={accentColorInput.replace(/^#/, "")}
                    onChange={(e) => {
                      const val = "#" + e.target.value.trim();
                      setAccentColorInput(val);
                      if (isValidHexColor(val)) {
                        applyAccentColor(val);
                        setProfile({ ...profile, accentColor: val });
                      }
                    }}
                    placeholder="38bdf8"
                    maxLength={6}
                    className="w-20 bg-transparent text-xs text-[#e5e5e5] outline-none uppercase font-bold"
                  />
                  <button
                    onClick={() => handleSelectAccent(accentColorInput, true)}
                    className="ml-2 text-[10px] border border-[#38bdf8] px-1.5 py-0.5 text-[#38bdf8] hover:bg-[#38bdf8] hover:text-[#000000]"
                  >
                    [APPLY]
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Presets Grid */}
          <div className="space-y-2">
            <div className="text-[11px] font-bold text-[#38bdf8]">
              -- SECTION B: CURATED TERMINAL PRESET PALETTES ({ACCENT_PRESETS.length}) --
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {ACCENT_PRESETS.map((preset) => {
                const isActive = preset.hex.toLowerCase() === accentColorInput.toLowerCase();
                return (
                  <div
                    key={preset.id}
                    onClick={() => handleSelectAccent(preset.hex, false)}
                    className={`border p-2.5 flex flex-col justify-between cursor-pointer transition-all ${
                      isActive
                        ? "border-[#38bdf8] bg-[#000000]"
                        : "border-[#e5e5e5] bg-[#000000] hover:border-[#38bdf8]"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between pb-1.5 border-b border-[#e5e5e5]/40 text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3.5 h-3.5 inline-block border border-[#e5e5e5] shrink-0"
                            style={{ backgroundColor: preset.hex }}
                          />
                          <span className="font-bold text-[#e5e5e5]">[{preset.asciiTag}]</span>
                        </div>
                        <span className="text-[10px] opacity-75">{preset.hex}</span>
                      </div>

                      <div className="mt-1.5 text-xs font-bold text-[#e5e5e5]">
                        {preset.name}
                      </div>
                      <p className="mt-0.5 text-[10px] text-[#e5e5e5]/70 leading-tight">
                        {preset.description}
                      </p>
                    </div>

                    <div className="mt-2.5 pt-1.5 border-t border-[#e5e5e5]/40 flex items-center justify-between text-[10px]">
                      <span className={isActive ? "text-[#38bdf8] font-bold" : "text-[#e5e5e5]/50"}>
                        {isActive ? "● CURRENT_ACTIVE" : "○ CLICK_TO_PREVIEW"}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectAccent(preset.hex, true);
                        }}
                        className={`px-1.5 py-0.5 border text-[10px] cursor-pointer ${
                          isActive
                            ? "border-[#38bdf8] bg-[#38bdf8] text-[#000000] font-bold"
                            : "border-[#e5e5e5] hover:border-[#38bdf8] hover:text-[#38bdf8]"
                        }`}
                      >
                        [SAVE ↵]
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Live Component Test Bench Preview */}
          <div className="border border-[#e5e5e5] p-3 bg-[#000000] space-y-3">
            <div className="flex items-center justify-between border-b border-[#e5e5e5] pb-2 text-[11px]">
              <span className="font-bold text-[#38bdf8]">
                -- SECTION C: LIVE COMPONENT TEST BENCH (REALTIME RENDER) --
              </span>
              <span className="text-[10px] text-[#e5e5e5]">COLOR: {accentColorInput}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
              {/* Box 1: Typography & Labels */}
              <div className="border border-[#e5e5e5] p-2.5 space-y-2">
                <div className="text-[10px] text-[#e5e5e5]/60">// TYPOGRAPHY ACCENT</div>
                <div className="text-sm font-bold text-[#38bdf8]">
                  === SECTION_HEADER ===
                </div>
                <div className="text-xs text-[#38bdf8]">
                  // High-speed Go CLIs &amp; TUIs
                </div>
                <div className="text-[11px] text-[#e5e5e5]">
                  Status telemetry: <span className="text-[#38bdf8] font-bold">● NOMINAL_200_OK</span>
                </div>
              </div>

              {/* Box 2: Buttons & Interactive Elements */}
              <div className="border border-[#e5e5e5] p-2.5 space-y-2">
                <div className="text-[10px] text-[#e5e5e5]/60">// BUTTONS &amp; BADGES</div>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-[#38bdf8] text-[#000000] px-1.5 py-0.5 font-bold text-[10px]">
                    [SOLID BADGE]
                  </span>
                  <span className="border border-[#38bdf8] text-[#38bdf8] px-1.5 py-0.5 text-[10px]">
                    [OUTLINE BADGE]
                  </span>
                </div>
                <div className="pt-1 flex flex-wrap gap-2">
                  <button
                    type="button"
                    className="border border-[#38bdf8] bg-[#38bdf8] text-[#000000] font-bold px-2 py-0.5 text-[11px]"
                  >
                    [ACTION BTN]
                  </button>
                  <button
                    type="button"
                    className="border border-[#38bdf8] text-[#38bdf8] px-2 py-0.5 text-[11px] hover:bg-[#38bdf8] hover:text-[#000000]"
                  >
                    [HOVER ME]
                  </button>
                </div>
              </div>

              {/* Box 3: Terminal Prompt & Borders */}
              <div className="border border-[#e5e5e5] p-2.5 space-y-2">
                <div className="text-[10px] text-[#e5e5e5]/60">// TERMINAL STATUSLINE</div>
                <div className="text-xs flex items-center gap-1.5">
                  <span className="text-[#38bdf8]">┌─[</span>
                  <span className="text-[#e5e5e5] font-bold">jurek@qzz.io</span>
                  <span className="text-[#38bdf8]">]</span>
                </div>
                <div className="text-[11px] text-[#38bdf8]">
                  └──&gt; 02:PROJECTS [8] · 03:ARTICLES [0]
                </div>
                <div className="border border-[#38bdf8] p-1 text-[10px] text-center text-[#38bdf8]">
                  [ACCENT BORDER HIGHLIGHT]
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* TAB 6: RAW JSON DATABASE & BACKUP/RESTORE */}
      {/* ======================================================== */}
      {!loading && activeTab === "raw_json" && (
        <div className="border border-[#e5e5e5] p-4 bg-[#000000] space-y-4">
          <div className="border-b border-[#e5e5e5] pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold text-[#38bdf8]">
                === RAW JSON DATABASE &amp; ZERO-LIMIT EDITOR ===
              </span>
              <p className="text-[11px] text-[#e5e5e5]">
                Directly edit, backup, or restore the entire portfolio database in structured JSON format.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportJson}
                className="border border-[#38bdf8] px-2 py-1 text-xs text-[#38bdf8] hover:bg-[#38bdf8] hover:text-[#000000]"
              >
                [EXPORT BACKUP]
              </button>
              <label className="border border-[#e5e5e5] px-2 py-1 text-xs text-[#e5e5e5] hover:border-[#38bdf8] hover:text-[#38bdf8] cursor-pointer">
                [IMPORT JSON]
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportJsonFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <textarea
              value={rawJsonText}
              onChange={(e) => setRawJsonText(e.target.value)}
              rows={20}
              className="w-full border border-[#e5e5e5] bg-[#000000] p-3 text-xs text-[#e5e5e5] font-mono outline-none focus:border-[#38bdf8]"
            />
          </div>

          <div className="pt-2 border-t border-[#e5e5e5] flex items-center justify-between">
            <button
              onClick={() => setRawJsonText(JSON.stringify({ posts, projects, skills, profile }, null, 2))}
              className="border border-[#e5e5e5] px-3 py-1 text-xs text-[#e5e5e5] hover:border-red-400 hover:text-red-400"
            >
              [RESET CHANGES]
            </button>
            <button
              onClick={handleApplyRawJson}
              disabled={saving}
              className="border border-[#38bdf8] bg-[#38bdf8] text-[#000000] font-bold px-3 py-1 text-xs hover:bg-[#000000] hover:text-[#38bdf8] cursor-pointer"
            >
              [APPLY &amp; SAVE RAW JSON ↵]
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
