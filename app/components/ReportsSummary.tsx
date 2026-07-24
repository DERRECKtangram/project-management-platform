"use client";

import Link from "next/link";
import { useFlowData } from "./useFlowData";

export function ReportsSummary() {
  const { data, loading, message } = useFlowData();

  return (
    <>
      {message ? <p className="form-message left">{message}</p> : null}
      <section className="report-grid">
        {data.phases.map((phase) => {
          const items = data.workflowItems.filter((item) => item.phase === phase);
          const done = items.filter((item) => item.status === "已完成").length;
          const missingDocs = items.filter((item) => !item.documentUrl).length;
          return (
            <article className="report-card" key={phase}>
              <span>{phase}</span>
              <h2>{phase}交付檢核</h2>
              <p>共 {items.length} 個小關，已完成 {done} 個，缺文件 {missingDocs} 個。</p>
              <footer>
                <b>{items.length === done && items.length > 0 ? "可彙整" : "需追蹤"}</b>
                <Link className="secondary-action" href="/projects">查看</Link>
              </footer>
            </article>
          );
        })}
      </section>

      <section className="panel">
        <div className="section-title">
          <div>
            <p>報告來源</p>
            <h2>依專案彙整進度與缺口</h2>
          </div>
        </div>
        {loading ? <p className="plain-copy">讀取中...</p> : null}
        {!loading && data.projects.length === 0 ? (
          <div className="empty-state">
            <h2>目前沒有可彙整的專案</h2>
            <p>建立專案並新增小關後，這裡會顯示報告素材。</p>
          </div>
        ) : null}
        <div className="project-table">
          {data.projects.map((project) => {
            const items = data.workflowItems.filter((item) => item.projectCode === project.code);
            const missingDocs = items.filter((item) => !item.documentUrl).length;
            return (
              <Link className="table-row clickable-row" href={`/projects/${encodeURIComponent(project.code)}`} key={project.code}>
                <div>
                  <b>{project.name}</b>
                  <span>{project.stage} / 下一步：{project.nextAction}</span>
                </div>
                <span>PM：{project.manager}</span>
                <strong>{project.progress}%</strong>
                <span>{items.length} 小關 / {missingDocs} 缺文件</span>
              </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}
