import Link from "next/link";
import { AppShell } from "../components/AppShell";

export default function FlowPage() {
  return (
    <AppShell
      active="/projects"
      eyebrow="流程管理"
      title="流程已整併到專案工作台"
      actions={<Link className="primary-action" href="/projects">前往專案中心</Link>}
    >
      <section className="panel empty-state">
        <h2>新的操作方式更單純</h2>
        <p>先選一個專案，再在專案內管理提案、啟動、期中、期末的小關，避免流程和案件分開造成混亂。</p>
      </section>
    </AppShell>
  );
}
