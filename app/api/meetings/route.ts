import { getDb } from "../../../db";
import * as schema from "../../../db/schema";
import { ensureSeedData, newId, routeError } from "../shared";

type MeetingPayload = {
  title?: string;
  project?: string;
  date?: string;
  chair?: string;
  attendees?: string;
  decisions?: string;
  risks?: string;
  nextReview?: string;
  taskTitle?: string;
  taskAssignee?: string;
  taskRole?: string;
  taskDue?: string;
  taskGate?: string;
};

function splitLines(value?: string) {
  return (value ?? "")
    .split(/\r?\n|、|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function POST(request: Request) {
  try {
    await ensureSeedData();
    const payload = (await request.json()) as MeetingPayload;
    const title = payload.title?.trim();
    const project = payload.project?.trim();
    const chair = payload.chair?.trim();

    if (!title || !project || !chair) {
      return Response.json({ error: "會議名稱、案件與主持人必填。" }, { status: 400 });
    }

    const meetingId = newId("MT");
    const decisionList = splitLines(payload.decisions);
    const riskList = splitLines(payload.risks);
    const db = getDb();

    const [meeting] = await db
      .insert(schema.meetingRecords)
      .values({
        id: meetingId,
        title,
        project,
        date: payload.date?.trim() || new Date().toISOString().slice(0, 16).replace("T", " "),
        chair,
        attendees: JSON.stringify(splitLines(payload.attendees).length ? splitLines(payload.attendees) : [chair]),
        decisions: JSON.stringify(decisionList.length ? decisionList : ["本次會議已建立紀錄，待補決議內容。"]),
        risks: JSON.stringify(riskList),
        nextReview: payload.nextReview?.trim() || "待安排",
      })
      .returning();

    let task = null;
    if (payload.taskTitle?.trim()) {
      const [createdTask] = await db
        .insert(schema.actionItems)
        .values({
          id: newId("A"),
          project,
          title: payload.taskTitle.trim(),
          assignee: payload.taskAssignee?.trim() || chair,
          role: payload.taskRole?.trim() || "專案管理人員",
          sourceMeeting: title,
          due: payload.taskDue?.trim() || "待安排",
          status: "待處理",
          gate: payload.taskGate?.trim() || "未指定關卡",
        })
        .returning();
      task = createdTask;
    }

    return Response.json({ meeting, task }, { status: 201 });
  } catch (error) {
    return Response.json({ error: routeError(error) }, { status: 500 });
  }
}
