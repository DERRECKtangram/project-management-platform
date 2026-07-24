import Link from "next/link";
import { AppShell } from "../components/AppShell";
import { ProjectListManager } from "../components/ProjectListManager";

export default function ProjectsPage() {
  return (
    <AppShell
      active="/projects"
      eyebrow="專案管理"
      title="建立專案，拆成四階段小關，再分配給窗口"
      actions={<Link className="secondary-action" href="/people">研發填報</Link>}
    >
      <ProjectListManager />
    </AppShell>
  );
}
