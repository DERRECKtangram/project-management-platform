import { eq } from "drizzle-orm";
import { getDb } from "../../db";
import * as schema from "../../db/schema";

function decodeList(value: string) {
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function ensureSeedData() {
  return getDb();
}

export async function getWorkspaceData() {
  const db = await ensureSeedData();
  const [members, projects, gateSteps, documents, meetingRecords, actionItems] =
    await Promise.all([
      db.select().from(schema.members),
      db.select().from(schema.projects),
      db.select().from(schema.gateSteps),
      db.select().from(schema.documents),
      db.select().from(schema.meetingRecords),
      db.select().from(schema.actionItems),
    ]);

  return {
    members,
    projects: projects.map((project) => ({
      ...project,
      developers: decodeList(project.developers),
    })),
    gateSteps,
    documents,
    meetingRecords: meetingRecords.map((meeting) => ({
      ...meeting,
      attendees: decodeList(meeting.attendees),
      decisions: decodeList(meeting.decisions),
      risks: decodeList(meeting.risks),
    })),
    actionItems,
  };
}

export function routeError(error: unknown) {
  const message = error instanceof Error ? error.message : "Unexpected error";
  if (message.includes("no such table")) {
    return "資料庫表格尚未建立，請先完成 Cloudflare D1 migration。";
  }
  if (message.includes("D1 binding `DB` is unavailable")) {
    return "目前環境沒有 D1 資料庫綁定；部署到 Cloudflare 後會由 Sites 提供 DB。";
  }
  return message;
}

export function newId(prefix: string) {
  return `${prefix}-${Date.now().toString(36).toUpperCase()}`;
}

export async function updateTaskStatus(id: string, status: string) {
  const db = await ensureSeedData();
  const [task] = await db
    .update(schema.actionItems)
    .set({ status })
    .where(eq(schema.actionItems.id, id))
    .returning();
  return task;
}
