import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "總覽", icon: "總" },
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
          <span>角色入口</span>
          <strong>PM 管流程，開發管交付</strong>
          <p>會議後的決議會轉成指定負責人的任務，所有人回來看自己的待辦與下一步。</p>
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
