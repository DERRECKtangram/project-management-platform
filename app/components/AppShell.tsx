import Link from "next/link";
import type { ReactNode } from "react";

const navItems = [
  { href: "/", label: "首頁", icon: "首" },
  { href: "/projects", label: "專案管理", icon: "管" },
  { href: "/people", label: "研發填報", icon: "研" },
  { href: "/settings", label: "設定", icon: "設" },
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
            <strong>輕量專案平台</strong>
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
          <span>使用方式</span>
          <strong>PM 建小關，研發填成果</strong>
          <p>管理者負責拆流程、指定窗口與期限；研發只看自己要填的內容，完成後補上文件連結。</p>
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
