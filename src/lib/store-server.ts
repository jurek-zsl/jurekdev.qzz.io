import "server-only";
import fs from "fs";
import path from "path";
import { POSTS } from "@/data/posts";
import { PROJECTS } from "@/data/projects";
import { TECH_STACK } from "@/data/tech-stack";
import { SiteData, DEFAULT_PROFILE, ContactMessage } from "./store-types";

const DB_PATH = path.join(process.cwd(), "src/data/db.json");

export function getSiteData(): SiteData {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        posts: Array.isArray(parsed.posts) ? parsed.posts : POSTS,
        projects: Array.isArray(parsed.projects) ? parsed.projects : PROJECTS,
        skills: Array.isArray(parsed.skills) ? parsed.skills : TECH_STACK,
        profile: parsed.profile ? { ...DEFAULT_PROFILE, ...parsed.profile } : DEFAULT_PROFILE,
        messages: Array.isArray(parsed.messages) ? parsed.messages : [],
      };
    }
  } catch (error) {
    console.error("Error reading db.json, falling back to defaults:", error);
  }

  return {
    posts: POSTS,
    projects: PROJECTS,
    skills: TECH_STACK,
    profile: DEFAULT_PROFILE,
    messages: [],
  };
}

export function saveSiteData(data: SiteData): boolean {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (error) {
    console.error("Error writing db.json:", error);
    return false;
  }
}

export function addContactMessage(msg: {
  name: string;
  email: string;
  type: string;
  message: string;
}): ContactMessage {
  const data = getSiteData();
  const newMsg: ContactMessage = {
    id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: msg.name.trim(),
    email: msg.email.trim(),
    type: msg.type.trim() || "PROJECT INQUIRY",
    message: msg.message.trim(),
    createdAt: new Date().toISOString(),
    read: false,
    replied: false,
  };
  const messages = [newMsg, ...(data.messages || [])];
  saveSiteData({ ...data, messages });
  return newMsg;
}

export function updateContactMessage(
  id: string,
  updates: { read?: boolean; replied?: boolean }
): boolean {
  const data = getSiteData();
  const messages = (data.messages || []).map((m) =>
    m.id === id ? { ...m, ...updates } : m
  );
  return saveSiteData({ ...data, messages });
}

export function deleteContactMessage(id: string): boolean {
  const data = getSiteData();
  const messages = (data.messages || []).filter((m) => m.id !== id);
  return saveSiteData({ ...data, messages });
}
