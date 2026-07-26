"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useFlowData } from "./useFlowData";

type DocumentWorkspaceProps = {
  code: string;
  itemId: string;
};

function normalizeDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const [year, month, day] = value.split("-");
  return `${year}/${Number(month)}/${Number(day)}`;
}

export function DocumentWorkspace({ code, itemId }: DocumentWorkspaceProps) {
  const { data, loading, message } = useFlowData();
  const project = data.projects.find((item) => item.code === code);
  const item = data.workflowItems.find((workflowItem) => workflowItem.id === itemId && workflowItem.projectCode === code);
  const nearbyItems = useMemo(
    () =>
      data.workflowItems
        .filter((workflowItem) => workflowItem.projectCode === code && workflowItem.phase === item?.phase)
        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
    [code, data.workflowItems, item?.phase],
  );

  if (loading) {
    return <p className="plain-copy">讀取文件頁中...</p>;
  }

  if (!project || !item) {
    return (
      <section className="panel empty-state">
        <h2>找不到這份文件</h2>
        <p>可能小關已移除，或文件連結尚未建立。</p>
        <Link className="primary-action" href={`/projects/${encodeURIComponent(code)}`}>回專案管理</Link>
      </section>
    );
  }

  return (
    <div className="document-workspace">
      <section className="project-hero panel">
        <div>
          <span>{project.code} / {item.phase}</span>
          <h2>{item.title}</h2>
          <p>{project.name} / 窗口：{item.owner} / 狀態：{item.status}</p>
        </div>
        <div className="document-actions">
          <Link className="secondary-action" href={`/projects/${encodeURIComponent(project.code)}`}>回專案管理</Link>
          {item.documentUrl ? (
            <a className="primary-action" href={item.documentUrl} rel="noreferrer" target="_blank">
              開啟原始文件
            </a>
          ) : null}
        </div>
      </section>

      {message ? <p className="form-message left">{message}</p> : null}

      <section className="document-detail-grid">
        <article className="panel document-main-card">
          <div className="section-title compact-title">
            <div>
              <p>文件內容</p>
              <h2>{item.documentUrl ? "此小關已有文件連結" : "此小關尚未提供文件"}</h2>
            </div>
          </div>
          {item.documentUrl ? (
            <div className="document-link-box">
              <span>文件或 Google 連結</span>
              <a href={item.documentUrl} rel="noreferrer" target="_blank">{item.documentUrl}</a>
            </div>
          ) : (
            <p className="plain-copy">請研發人員到「研發填報」補上成果文件或 Google 連結。</p>
          )}
          <div className="document-summary">
            <span>研發填報內容</span>
            <p>{item.content === "待補內容" ? "尚未填寫" : item.content}</p>
          </div>
        </article>

        <aside className="panel document-side-card">
          <h2>小關資訊</h2>
          <dl>
            <div>
              <dt>階段</dt>
              <dd>{item.phase}</dd>
            </div>
            <div>
              <dt>窗口</dt>
              <dd>{item.owner}</dd>
            </div>
            <div>
              <dt>角色</dt>
              <dd>{item.role}</dd>
            </div>
            <div>
              <dt>期限</dt>
              <dd>{normalizeDate(item.dueDate)}</dd>
            </div>
            <div>
              <dt>完成</dt>
              <dd>{item.completedAt || "尚未完成"}</dd>
            </div>
          </dl>
        </aside>
      </section>

      {nearbyItems.length > 1 ? (
        <section className="panel document-related">
          <div className="section-title compact-title">
            <div>
              <p>同階段小關</p>
              <h2>{item.phase}階段的其他文件</h2>
            </div>
          </div>
          <div>
            {nearbyItems.map((workflowItem, index) => (
              <Link
                className={workflowItem.id === item.id ? "active" : ""}
                href={`/projects/${encodeURIComponent(project.code)}/documents/${encodeURIComponent(workflowItem.id)}`}
                key={workflowItem.id}
              >
                <strong>{data.phases.indexOf(workflowItem.phase) + 1}-{index + 1}</strong>
                <span>{workflowItem.title}</span>
                <small>{workflowItem.documentUrl ? "已有文件" : "缺文件"}</small>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
