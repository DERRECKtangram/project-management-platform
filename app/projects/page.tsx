import Link from "next/link";
import { AppShell } from "../components/AppShell";
import { ProjectListManager } from "../components/ProjectListManager";

export default function ProjectsPage() {
  return (
    <AppShell
      active="/projects"
      eyebrow="專案中心"
      title="先建立主案件，再把四階段拆成可追蹤的小關"
      actions={<Link className="secondary-action" href="/meetings">會議紀錄</Link>}
    >
      <ProjectListManager />
    </AppShell>
  );
}
