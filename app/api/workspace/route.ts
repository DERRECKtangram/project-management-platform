import { getWorkspaceData, routeError } from "../shared";

export async function GET() {
  try {
    return Response.json(await getWorkspaceData());
  } catch (error) {
    return Response.json({ error: routeError(error) }, { status: 500 });
  }
}
