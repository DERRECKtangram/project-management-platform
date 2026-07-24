import { eq } from "drizzle-orm";
import { getDb } from "../../../db";
import * as schema from "../../../db/schema";
import { ensureSeedData, newId, routeError } from "../shared";

const phases = ["提案", "啟動", "期中", "期末"];

type FlowPayload = {
  action?: "create-project" | "create-item" | "update-item";
  projectCode?: string;
  projectName?: string;
  agency?: string;
  manager?: string;
  developers?: string;
  budget?: string;
  due?: string;
  risk?: string;
  phase?: string;
  title?: string;
  owner?: string;
  role?: string;
  content?: string;
  dueDate?: string;
  id?: string;
  status?: string;
  documentUrl?: string;
};

function encodeDevelopers(value?: string) {
  return JSON.stringify(
    (value ?? "")
      .split(/、|,|\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

async function ensureWorkflowSeed() {
  await ensureSeedData();
  return getDb();
}

export async function GET() {
  try {
    const db = await ensureWorkflowSeed();
    const [projects, workflowItems] = await Promise.all([
      db.select().from(schema.projects),
      db.select().from(schema.workflowItems),
    ]);

    return Response.json({
      phases,
      projects: projects.map((project) => ({
        ...project,
        developers: JSON.parse(project.developers || "[]"),
      })),
      workflowItems,
    });
  } catch (error) {
    return Response.json({ error: routeError(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = await ensureWorkflowSeed();
    const payload = (await request.json()) as FlowPayload;

    if (payload.action === "create-project") {
      const code = payload.projectCode?.trim() || newId("PRJ");
      const name = payload.projectName?.trim();
      if (!name) {
        return Response.json({ error: "專案名稱必填。" }, { status: 400 });
      }

      const [project] = await db
        .insert(schema.projects)
        .values({
          code,
          name,
          agency: payload.agency?.trim() || "未指定",
          manager: payload.manager?.trim() || "未指定",
          developers: encodeDevelopers(payload.developers),
          stage: "提案",
          progress: 0,
          risk: payload.risk?.trim() || "中",
          due: payload.due?.trim() || "未指定",
          budget: payload.budget?.trim() || "未指定",
          nextAction: "建立第一個小關",
        })
        .returning();

      return Response.json({ project: { ...project, developers: JSON.parse(project.developers) } }, { status: 201 });
    }

    if (payload.action === "create-item") {
      const projectCode = payload.projectCode?.trim();
      const projectName = payload.projectName?.trim();
      const title = payload.title?.trim();
      if (!projectCode || !projectName || !title) {
        return Response.json({ error: "專案與小關名稱必填。" }, { status: 400 });
      }

      const [item] = await db
        .insert(schema.workflowItems)
        .values({
          id: newId("WF"),
          projectCode,
          projectName,
          phase: payload.phase?.trim() || "提案",
          title,
          owner: payload.owner?.trim() || "未指定",
          role: payload.role?.trim() || "專案管理人員",
          content: payload.content?.trim() || "待補內容",
          dueDate: payload.dueDate?.trim() || "未指定",
          status: "待處理",
          documentUrl: payload.documentUrl?.trim() || "",
          completedAt: "",
        })
        .returning();

      return Response.json({ item }, { status: 201 });
    }

    return Response.json({ error: "未知操作。" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: routeError(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const db = await ensureWorkflowSeed();
    const payload = (await request.json()) as FlowPayload;
    const id = payload.id?.trim();

    if (!id) {
      return Response.json({ error: "小關 id 必填。" }, { status: 400 });
    }

    const status = payload.status?.trim();
    const documentUrl = payload.documentUrl?.trim();
    const update: Partial<typeof schema.workflowItems.$inferInsert> = {};

    if (status) {
      update.status = status;
      update.completedAt = status === "已完成" ? new Date().toISOString().slice(0, 10) : "";
    }
    if (documentUrl !== undefined) {
      update.documentUrl = documentUrl;
    }

    const [item] = await db
      .update(schema.workflowItems)
      .set(update)
      .where(eq(schema.workflowItems.id, id))
      .returning();

    if (!item) {
      return Response.json({ error: "找不到小關。" }, { status: 404 });
    }

    return Response.json({ item });
  } catch (error) {
    return Response.json({ error: routeError(error) }, { status: 500 });
  }
}
