import { asc, eq } from "drizzle-orm";
import { getDb } from "../../../db";
import * as schema from "../../../db/schema";
import { ensureSeedData, newId, routeError } from "../shared";

const phases = ["提案", "啟動", "期中", "期末"];
const doneStatus = "已完成";

type FlowPayload = {
  action?: "create-project" | "create-item" | "reorder-items";
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
  position?: number;
  items?: Array<{
    id: string;
    phase: string;
    position: number;
  }>;
};

type WorkflowRow = typeof schema.workflowItems.$inferSelect;

function normalizeStatus(status?: string) {
  if (status === "已完成") return "已完成";
  if (status === "進行中" || status === "待確認") return "進行中";
  return "未處理";
}

function encodeDevelopers(value?: string) {
  return JSON.stringify(
    (value ?? "")
      .split(/、|,|\r?\n/)
      .map((item) => item.trim())
      .filter(Boolean),
  );
}

function decodeDevelopers(value: string) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function calculateProjectRollup(items: WorkflowRow[]) {
  const progress = Math.round(
    phases.reduce((total, phase) => {
      const phaseItems = items.filter((item) => item.phase === phase);
      if (phaseItems.length === 0) return total;
      const doneCount = phaseItems.filter((item) => normalizeStatus(item.status) === doneStatus).length;
      return total + (doneCount / phaseItems.length) * 25;
    }, 0),
  );
  const stage =
    phases.find((phase) => {
      const phaseItems = items.filter((item) => item.phase === phase);
      return phaseItems.length === 0 || phaseItems.some((item) => normalizeStatus(item.status) !== doneStatus);
    }) ?? phases[phases.length - 1];
  const firstOpen = items.find((item) => item.phase === stage && normalizeStatus(item.status) !== doneStatus);
  const nextAction = firstOpen
    ? `${firstOpen.phase}：${firstOpen.title}`
    : progress >= 100
      ? "所有小關已完成，準備結案封存"
      : `${stage}：新增或完成小關`;

  return { progress, stage, nextAction };
}

async function getFlowDb() {
  await ensureSeedData();
  return getDb();
}

async function updateProjectRollup(projectCode: string) {
  const db = await getDb();
  const items = await db
    .select()
    .from(schema.workflowItems)
    .where(eq(schema.workflowItems.projectCode, projectCode))
    .orderBy(asc(schema.workflowItems.phase), asc(schema.workflowItems.position), asc(schema.workflowItems.createdAt));

  const rollup = calculateProjectRollup(items);

  await db
    .update(schema.projects)
    .set(rollup)
    .where(eq(schema.projects.code, projectCode));
}

export async function GET() {
  try {
    const db = await getFlowDb();
    const [projects, workflowItems] = await Promise.all([
      db.select().from(schema.projects),
      db
        .select()
        .from(schema.workflowItems)
        .orderBy(
          asc(schema.workflowItems.projectCode),
          asc(schema.workflowItems.phase),
          asc(schema.workflowItems.position),
          asc(schema.workflowItems.createdAt),
        ),
    ]);

    return Response.json({
      phases,
      projects: projects.map((project) => {
        const projectItems = workflowItems.filter((item) => item.projectCode === project.code);
        const rollup = calculateProjectRollup(projectItems);
        return {
          ...project,
          ...rollup,
          developers: decodeDevelopers(project.developers),
        };
      }),
      workflowItems: workflowItems.map((item) => ({
        ...item,
        status: normalizeStatus(item.status),
      })),
    });
  } catch (error) {
    return Response.json({ error: routeError(error) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const db = await getFlowDb();
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

      return Response.json({ project: { ...project, developers: decodeDevelopers(project.developers) } }, { status: 201 });
    }

    if (payload.action === "create-item") {
      const projectCode = payload.projectCode?.trim();
      const projectName = payload.projectName?.trim();
      const title = payload.title?.trim();
      if (!projectCode || !projectName || !title) {
        return Response.json({ error: "專案與小關名稱必填。" }, { status: 400 });
      }

      const phase = phases.includes(payload.phase ?? "") ? payload.phase!.trim() : "提案";
      const existingPhaseItems = await db
        .select()
        .from(schema.workflowItems)
        .where(eq(schema.workflowItems.projectCode, projectCode));
      const nextPosition =
        existingPhaseItems
          .filter((item) => item.phase === phase)
          .reduce((max, item) => Math.max(max, item.position ?? 0), 0) + 1000;
      const [item] = await db
        .insert(schema.workflowItems)
        .values({
          id: newId("WF"),
          projectCode,
          projectName,
          phase,
          title,
          owner: payload.owner?.trim() || "未指定",
          role: payload.role?.trim() || "專案管理人員",
          content: payload.content?.trim() || "待補內容",
          dueDate: payload.dueDate?.trim() || "未指定",
          status: "未處理",
          documentUrl: payload.documentUrl?.trim() || "",
          completedAt: "",
          position: nextPosition,
        })
        .returning();

      await updateProjectRollup(projectCode);
      return Response.json({ item }, { status: 201 });
    }

    return Response.json({ error: "未知操作。" }, { status: 400 });
  } catch (error) {
    return Response.json({ error: routeError(error) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const db = await getFlowDb();
    const payload = (await request.json()) as FlowPayload;

    if (payload.action === "reorder-items") {
      const updates = (payload.items ?? []).filter((item) => item.id && phases.includes(item.phase));
      if (updates.length === 0) {
        return Response.json({ error: "沒有可更新的小關順序。" }, { status: 400 });
      }

      const touchedProjects = new Set<string>();
      for (const reorderedItem of updates) {
        const existing = await db
          .select()
          .from(schema.workflowItems)
          .where(eq(schema.workflowItems.id, reorderedItem.id))
          .get();
        if (!existing) continue;

        touchedProjects.add(existing.projectCode);
        await db
          .update(schema.workflowItems)
          .set({ phase: reorderedItem.phase, position: reorderedItem.position })
          .where(eq(schema.workflowItems.id, reorderedItem.id));
      }

      await Promise.all([...touchedProjects].map((projectCode) => updateProjectRollup(projectCode)));
      return Response.json({ ok: true });
    }

    const id = payload.id?.trim();

    if (!id) {
      return Response.json({ error: "小關 id 必填。" }, { status: 400 });
    }

    const existing = await db
      .select()
      .from(schema.workflowItems)
      .where(eq(schema.workflowItems.id, id))
      .get();

    if (!existing) {
      return Response.json({ error: "找不到小關。" }, { status: 404 });
    }

    const update: Partial<typeof schema.workflowItems.$inferInsert> = {};
    if (payload.status !== undefined) {
      const normalizedStatus = normalizeStatus(payload.status?.trim());
      update.status = normalizedStatus;
      update.completedAt = normalizedStatus === doneStatus ? new Date().toISOString().slice(0, 10) : "";
    }
    if (payload.documentUrl !== undefined) {
      update.documentUrl = payload.documentUrl.trim();
    }
    if (payload.content !== undefined) {
      update.content = payload.content.trim() || "待補內容";
    }
    if (payload.title !== undefined) {
      update.title = payload.title.trim() || existing.title;
    }
    if (payload.owner !== undefined) {
      update.owner = payload.owner.trim() || "未指定";
    }
    if (payload.role !== undefined) {
      update.role = payload.role.trim() || existing.role;
    }
    if (payload.dueDate !== undefined) {
      update.dueDate = payload.dueDate.trim() || "未指定";
    }
    if (payload.phase !== undefined) {
      update.phase = phases.includes(payload.phase.trim()) ? payload.phase.trim() : existing.phase;
    }
    if (payload.position !== undefined && Number.isFinite(payload.position)) {
      update.position = payload.position;
    }

    const [item] = await db
      .update(schema.workflowItems)
      .set(update)
      .where(eq(schema.workflowItems.id, id))
      .returning();

    await updateProjectRollup(existing.projectCode);
    return Response.json({ item: { ...item, status: normalizeStatus(item.status) } });
  } catch (error) {
    return Response.json({ error: routeError(error) }, { status: 500 });
  }
}
