import Link from "next/link";
import { AppShell } from "./components/AppShell";
import { DashboardHome } from "./components/DashboardHome";

export default function DashboardPage() {
  return (
    <AppShell
      active="/"
      eyebrow="營運總覽"
      title="讓計畫人員與研發人員看到同一條專案流程"
      actions={
        <>
          <Link className="primary-action" href="/projects">新增專案</Link>
          <Link className="secondary-action" href="/meetings">查看會議</Link>
        </>
      }
    >
      <DashboardHome />
    </AppShell>
  );
}
