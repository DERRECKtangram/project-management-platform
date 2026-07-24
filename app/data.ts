export type GateStatus = "done" | "active" | "risk" | "waiting";
export type RiskLevel = "低" | "中" | "高";
export type RoleType = "專案管理人員" | "研發人員" | "管理層";

export type Project = {
  code: string;
  name: string;
  agency: string;
  manager: string;
  developers: string[];
  stage: string;
  progress: number;
  risk: RiskLevel | string;
  due: string;
  budget: string;
  nextAction: string;
};

export type Member = {
  name: string;
  role: RoleType | string;
  team: string;
  focus: string;
  assigned: number;
  overdue: number;
};

export type GateStep = {
  gate: string;
  color: "amber" | "blue" | "violet" | "green" | string;
  step: string;
  title: string;
  mission: string;
  condition: string;
  benefit: string;
  next: string;
  owner: string;
  assignee: string;
  status: GateStatus;
};

export type DocumentItem = {
  name: string;
  project: string;
  gate: string;
  status: "已收齊" | "需補件" | "待上傳" | "待確認" | string;
  owner: string;
  updated: string;
};

export type ActionItem = {
  id: string;
  project: string;
  title: string;
  assignee: string;
  role: RoleType | string;
  sourceMeeting: string;
  due: string;
  status: "待處理" | "進行中" | "待確認" | "已完成" | string;
  gate: string;
};

export type MeetingRecord = {
  id: string;
  title: string;
  project: string;
  date: string;
  chair: string;
  attendees: string[];
  decisions: string[];
  risks: string[];
  nextReview: string;
};

export const statusText: Record<GateStatus, string> = {
  done: "已完成",
  active: "進行中",
  risk: "有風險",
  waiting: "待啟動",
};

export const members: Member[] = [];
export const projects: Project[] = [];
export const gateSteps: GateStep[] = [];
export const documents: DocumentItem[] = [];
export const meetingRecords: MeetingRecord[] = [];
export const actionItems: ActionItem[] = [];
export const meetings: Array<{
  title: string;
  project: string;
  date: string;
  owner: string;
  outcome: string;
}> = [];
