import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const members = sqliteTable("members", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  team: text("team").notNull(),
  focus: text("focus").notNull(),
  assigned: integer("assigned").notNull().default(0),
  overdue: integer("overdue").notNull().default(0),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const projects = sqliteTable("projects", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  agency: text("agency").notNull(),
  manager: text("manager").notNull(),
  developers: text("developers").notNull(),
  stage: text("stage").notNull(),
  progress: integer("progress").notNull().default(0),
  risk: text("risk").notNull(),
  due: text("due").notNull(),
  budget: text("budget").notNull(),
  nextAction: text("next_action").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const gateSteps = sqliteTable("gate_steps", {
  id: text("id").primaryKey(),
  gate: text("gate").notNull(),
  color: text("color").notNull(),
  step: text("step").notNull(),
  title: text("title").notNull(),
  mission: text("mission").notNull(),
  condition: text("condition").notNull(),
  benefit: text("benefit").notNull(),
  next: text("next").notNull(),
  owner: text("owner").notNull(),
  assignee: text("assignee").notNull(),
  status: text("status").notNull(),
});

export const documents = sqliteTable("documents", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  project: text("project").notNull(),
  gate: text("gate").notNull(),
  status: text("status").notNull(),
  owner: text("owner").notNull(),
  updated: text("updated").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const meetingRecords = sqliteTable("meeting_records", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  project: text("project").notNull(),
  date: text("date").notNull(),
  chair: text("chair").notNull(),
  attendees: text("attendees").notNull(),
  decisions: text("decisions").notNull(),
  risks: text("risks").notNull(),
  nextReview: text("next_review").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const actionItems = sqliteTable("action_items", {
  id: text("id").primaryKey(),
  project: text("project").notNull(),
  title: text("title").notNull(),
  assignee: text("assignee").notNull(),
  role: text("role").notNull(),
  sourceMeeting: text("source_meeting").notNull(),
  due: text("due").notNull(),
  status: text("status").notNull(),
  gate: text("gate").notNull(),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
