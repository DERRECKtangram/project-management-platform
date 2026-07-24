import Link from "next/link";
import { AppShell } from "./components/AppShell";
import { DashboardHome } from "./components/DashboardHome";

export default function DashboardPage() {
  return (
    <AppShell
      active="/"
      eyebrow="首頁"
      title="選擇你今天要做的事"
      actions={
        <>
          <Link className="primary-action" href="/projects">我要管理專案</Link>
          <Link className="secondary-action" href="/people">我要填成果</Link>
        </>
      }
    >
      <DashboardHome />
    </AppShell>
  );
}
