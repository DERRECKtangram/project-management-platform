"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useFlowData } from "./useFlowData";

export function DashboardHome() {
  const { data, loading, message } = useFlowData();

  const summary = useMemo(() => {
    const totalItems = data.workflowItems.length;
    const doneItems = data.workflowItems.filter((item) => item.status === "已完成").length;
    const waitingDocs = data.workflowItems.filter((item) => !item.documentUrl).length;
    const activeProjects = data.projects.filter((project) => project.progress < 100).length;
    return { totalItems, doneItems, waitingDocs, activeProjects };
  }, [data]);

  const upcomingItems = [...data.workflowItems]
    .filter((item) => item.status !== "已完成")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 5);

  return (
    <>
      {message ? <p className="form-message left">{message}</p> : null}

      <section className="home-actions">
        <Link className="home-action-card pm-card" href="/projects">
          <span>專案管理</span>
          <h2>建立專案、拆小關、指派窗口</h2>
          <p>給計畫人員使用：管理提案、啟動、期中、期末四階段，確認每個小關的內容與期限。</p>
          <strong>進入管理</strong>
        </Link>
        <Link className="home-action-card rd-card" href="/people">
          <span>研發填報</span>
          <h2>看自己的任務，填成果與文件</h2>
          <p>給研發人員使用：只聚焦在被分配的小關，完成後更新狀態並貼上 Google 或文件連結。</p>
          <strong>進入填報</strong>
        </Link>
      </section>

      <section className="metric-grid soft-metrics">
        <article>
          <span>進行中專案</span>
          <strong>{summary.activeProjects}</strong>
          <small>尚未全部完成</small>
        </article>
        <article>
          <span>全部小關</span>
          <strong>{summary.totalItems}</strong>
          <small>四階段合計</small>
        </article>
        <article>
          <span>已完成</span>
          <strong>{summary.doneItems}</strong>
          <small>已標記完成</small>
        </article>
        <article>
          <span>缺文件</span>
          <strong>{summary.waitingDocs}</strong>
          <small>尚未貼連結</small>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="panel large-panel">
          <div className="section-title">
            <div>
              <p>專案進度</p>
              <h2>目前主案件</h2>
            </div>
            <Link href="/projects">專案管理</Link>
          </div>
          {loading ? <p className="plain-copy">讀取中...</p> : null}
          {!loading && data.projects.length === 0 ? (
            <div className="empty-state">
              <h2>還沒有專案</h2>
              <p>先從「專案管理」建立第一個專案，再新增四階段小關。</p>
              <Link className="primary-action" href="/projects">建立專案</Link>
            </div>
          ) : null}
          <div className="project-table">
            {data.projects.map((project) => (
              <Link className="table-row clickable-row" href={`/projects/${encodeURIComponent(project.code)}`} key={project.code}>
                <div>
                  <b>{project.name}</b>
                  <span>{project.code} / PM：{project.manager} / 研發：{project.developers.join("、") || "未指定"}</span>
                </div>
                <span className={`risk-pill risk-${project.risk}`}>風險 {project.risk}</span>
                <div className="progress-cell">
                  <div className="progress-track">
                    <span style={{ width: `${project.progress}%` }} />
                  </div>
                  <b>{project.progress}%</b>
                </div>
                <strong>{project.due}</strong>
              </Link>
            ))}
          </div>
        </article>

        <aside className="panel">
          <div className="section-title compact">
            <div>
              <p>研發待填</p>
              <h2>近期小關</h2>
            </div>
            <Link href="/people">填報</Link>
          </div>
          {upcomingItems.length === 0 ? <p className="plain-copy">目前沒有待處理小關。</p> : null}
          {upcomingItems.map((item) => (
            <Link className="focus-card rd-focus" href="/people" key={item.id}>
              <span>{item.projectName} / {item.phase}</span>
              <strong>{item.title}</strong>
              <p>{item.owner} / {item.dueDate} / {item.status}</p>
            </Link>
          ))}
        </aside>
      </section>
    </>
  );
}
