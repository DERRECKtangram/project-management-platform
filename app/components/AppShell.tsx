import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "總覽", icon: "總" },
  { href: "/flow", label: "流程管理", icon: "流" },
  { href: "/projects", label: "案件管理", icon: "案" },
  { href: "/people", label: "人員與任務", icon: "人" },
  { href: "/gates", label: "四大關任務", icon: "關" },
  { href: "/documents", label: "附件資料庫", icon: "檔" },
  { href: "/meetings", label: "會議紀錄", icon: "會" },
  { href: "/reports", label: "報告中心", icon: "報" },
  { href: "/settings", label: "角色與規則", icon: "設" },
];

type AppShellProps = {
  active: string;
  title: string;
  eyebrow: string;
  actions?: ReactNode;
  children: ReactNode;
};

export function AppShell({ active, title, eyebrow, actions, children }: AppShellProps) {
  return (
    <main className="app-shell">
      <aside className="app-sidebar">
        <Link className="brand" href="/">
          <span className="brand-mark">PM</span>
          <span>
            <small>政府計畫案</small>
            <strong>專案管理平台</strong>
          </span>
        </Link>

        <nav className="main-nav" aria-label="主要功能">
          {navItems.map((item) => (
            <Link className={active === item.href ? "active" : ""} href={item.href} key={item.href}>
              <span aria-hidden="true">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        <section className="sidebar-summary">
          <span>流程核心</span>
          <strong>提案、啟動、期中、期末</strong>
          <p>每個小關都要有窗口、內容、結束時間與文件連結，讓計畫人員和研發對齊。</p>
        </section>
      </aside>

      <section className="app-main">
        <header className="page-header">
          <div>
            <p>{eyebrow}</p>
            <h1>{title}</h1>
          </div>
          {actions ? <div className="page-actions">{actions}</div> : null}
        </header>
        {children}
      </section>
    </main>
  );
}
