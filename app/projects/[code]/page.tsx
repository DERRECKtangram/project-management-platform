import Link from "next/link";
import { AppShell } from "../../components/AppShell";
import { ProjectWorkspace } from "../../components/ProjectWorkspace";

type ProjectPageProps = {
  params: Promise<{ code: string }>;
};

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { code } = await params;

  return (
    <AppShell
      active="/projects"
      eyebrow="專案工作台"
      title="管理四階段小關、窗口、內容、期限與文件"
      actions={<Link className="secondary-action" href="/projects">回專案列表</Link>}
    >
      <ProjectWorkspace code={decodeURIComponent(code)} />
    </AppShell>
  );
}
