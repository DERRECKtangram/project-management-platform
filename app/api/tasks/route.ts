import { routeError, updateTaskStatus } from "../shared";

type TaskPayload = {
  id?: string;
  status?: string;
};

export async function PATCH(request: Request) {
  try {
    const payload = (await request.json()) as TaskPayload;
    const id = payload.id?.trim();
    const status = payload.status?.trim();

    if (!id || !status) {
      return Response.json({ error: "任務 id 與狀態必填。" }, { status: 400 });
    }

    const task = await updateTaskStatus(id, status);
    if (!task) {
      return Response.json({ error: "找不到任務。" }, { status: 404 });
    }

    return Response.json({ task });
  } catch (error) {
    return Response.json({ error: routeError(error) }, { status: 500 });
  }
}
