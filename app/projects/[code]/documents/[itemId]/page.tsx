import Link from "next/link";
import { AppShell } from "../../../../components/AppShell";
import { DocumentWorkspace } from "../../../../components/DocumentWorkspace";

type ProjectDocumentPageProps = {
  params: Promise<{
    code: string;
    itemId: string;
  }>;
};

export default async function ProjectDocumentPage({ params }: ProjectDocumentPageProps) {
  const { code, itemId } = await params;
  const projectCode = decodeURIComponent(code);

  return (
    <AppShell
      active="/projects"
      eyebrow="文件頁"
      title="小關文件與研發回填內容"
      actions={<Link className="secondary-action" href={`/projects/${encodeURIComponent(projectCode)}`}>回專案管理</Link>}
    >
      <DocumentWorkspace code={projectCode} itemId={decodeURIComponent(itemId)} />
    </AppShell>
  );
}
