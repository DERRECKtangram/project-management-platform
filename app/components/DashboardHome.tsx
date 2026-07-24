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
    .slice(0, 6);

  return (
    <>
      {message ? <p className="form-message left">{message}</p> : null}
      <section className="role-entry-grid">
        <article className="entry-card manager-entry">
          <span>計畫人員</span>
          <h2>看每個專案卡在哪一關</h2>
          <p>從總覽掌握進度，再進入專案確認小關、會議後續、文件連結與負責窗口。</p>
          <strong>{summary.activeProjects} 個進行中專案</strong>
        </article>
        <article className="entry-card developer-entry">
          <span>研發人員</span>
          <h2>確認自己要交付的內容</h2>
          <p>每個小關都寫清楚方向、截止日與文件位置，完成後直接標記狀態。</p>
          <strong>{summary.totalItems - summary.doneItems} 個待處理小關</strong>
        </article>
      </section>

      <section className="metric-grid">
        <article>
          <span>正式專案</span>
          <strong>{data.projects.length}</strong>
          <small>從專案清單建立</small>
        </article>
        <article>
          <span>流程小關</span>
          <strong>{summary.totalItems}</strong>
          <small>提案、啟動、期中、期末</small>
        </article>
        <article>
          <span>已完成</span>
          <strong>{summary.doneItems}</strong>
          <small>研發或計畫人員已打勾</small>
        </article>
        <article>
          <span>缺文件</span>
          <strong>{summary.waitingDocs}</strong>
          <small>尚未放 Google 或文件連結</small>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="panel large-panel">
          <div className="section-title">
            <div>
              <p>專案進度</p>
              <h2>目前所有主案件</h2>
            </div>
            <Link href="/projects">管理專案</Link>
          </div>
          {loading ? <p className="plain-copy">讀取中...</p> : null}
          {!loading && data.projects.length === 0 ? (
            <div className="empty-state">
              <h2>還沒有專案</h2>
              <p>請先建立第一個專案，再依四階段新增小關。</p>
              <Link className="primary-action" href="/projects">新增專案</Link>
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
              <p>下一步</p>
              <h2>近期待完成小關</h2>
            </div>
          </div>
          {upcomingItems.length === 0 ? <p className="plain-copy">目前沒有待處理小關。</p> : null}
          {upcomingItems.map((item) => (
            <Link className="focus-card" href={`/projects/${encodeURIComponent(item.projectCode)}`} key={item.id}>
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
