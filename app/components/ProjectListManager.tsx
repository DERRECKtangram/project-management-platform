"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import type { ProjectRecord } from "./flowTypes";
import { useFlowData } from "./useFlowData";

export function ProjectListManager() {
  const { data, loading, message, setMessage, refresh } = useFlowData();
  const [saving, setSaving] = useState(false);
  const [editingCode, setEditingCode] = useState("");
  const [projectSavingCode, setProjectSavingCode] = useState("");

  async function createProject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setSaving(true);
    setMessage("");

    const form = new FormData(formElement);
    try {
      const response = await fetch("/api/flow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-project",
          projectName: form.get("projectName"),
          agency: form.get("agency"),
          manager: form.get("manager"),
          developers: form.get("developers"),
          due: form.get("due"),
          budget: form.get("budget"),
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error || "建立專案失敗");
      }
      formElement.reset();
      await refresh();
      setMessage("專案已建立，可以點進去新增四階段小關。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "建立專案失敗");
    } finally {
      setSaving(false);
    }
  }

  async function saveProject(project: ProjectRecord, event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setProjectSavingCode(project.code);
    setMessage("");

    try {
      const response = await fetch("/api/flow", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update-project",
          projectCode: project.code,
          projectName: form.get("projectName"),
          agency: form.get("agency"),
          manager: form.get("manager"),
          developers: form.get("developers"),
          due: form.get("due"),
          budget: form.get("budget"),
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error || "儲存專案失敗");
      }
      setEditingCode("");
      await refresh();
      setMessage("專案資料已更新。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "儲存專案失敗");
    } finally {
      setProjectSavingCode("");
    }
  }

  async function deleteProject(project: ProjectRecord) {
    const shouldDelete = window.confirm(`確定刪除「${project.name}」？此專案底下的小關也會一起刪除。`);
    if (!shouldDelete) return;

    setProjectSavingCode(project.code);
    setMessage("");
    try {
      const response = await fetch("/api/flow", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "delete-project",
          projectCode: project.code,
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error || "刪除專案失敗");
      }
      await refresh();
      setMessage("專案已刪除。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "刪除專案失敗");
    } finally {
      setProjectSavingCode("");
    }
  }

  return (
    <div className="manager-layout">
      <section className="panel">
        <div className="section-title">
          <div>
            <p>建立主案件</p>
            <h2>先建立專案，再進入專案拆四階段小關</h2>
          </div>
        </div>

        <form className="meeting-form project-form" onSubmit={createProject}>
          <label>
            專案名稱
            <input name="projectName" placeholder="例如 智慧資料整合平台" required />
          </label>
          <label>
            補助/機關
            <input name="agency" placeholder="例如 經濟部、地方政府" />
          </label>
          <label>
            計畫人員
            <input name="manager" placeholder="主要 PM 或窗口" />
          </label>
          <label className="wide-field">
            研發窗口
            <input name="developers" placeholder="可用頓號、逗號或換行分隔多人" />
          </label>
          <label>
            總期限
            <input name="due" type="date" />
          </label>
          <label>
            預算
            <input name="budget" placeholder="例如 300 萬" />
          </label>
          <button className="primary-action" disabled={saving} type="submit">
            {saving ? "建立中" : "建立專案"}
          </button>
        </form>
        {message ? <p className="form-message left">{message}</p> : null}
      </section>

      <section className="panel">
        {loading ? <p className="plain-copy">讀取專案中...</p> : null}
        {!loading && data.projects.length === 0 ? (
          <div className="empty-state">
            <h2>目前沒有正式專案</h2>
            <p>請先建立一個主案件，之後每個專案可以自由新增四階段底下的小關。</p>
          </div>
        ) : null}

        <div className="project-board">
          {data.projects.map((project) => {
            const items = data.workflowItems.filter((item) => item.projectCode === project.code);
            const done = items.filter((item) => item.status === "已完成").length;
            return (
              <article className="project-detail-card" key={project.code}>
                <div className="card-head">
                  <span>{project.code}</span>
                  <div className="card-actions">
                    <button
                      className="secondary-action small-action"
                      disabled={projectSavingCode === project.code}
                      onClick={() => setEditingCode(editingCode === project.code ? "" : project.code)}
                      type="button"
                    >
                      {editingCode === project.code ? "收起" : "編輯"}
                    </button>
                    <button
                      className="danger-action small-action"
                      disabled={projectSavingCode === project.code}
                      onClick={() => void deleteProject(project)}
                      type="button"
                    >
                      刪除
                    </button>
                  </div>
                </div>
                <Link className="project-card-main clickable-card" href={`/projects/${encodeURIComponent(project.code)}`}>
                  <h2>{project.name}</h2>
                  <p>{project.agency}</p>
                  <div className="progress-cell wide">
                    <div className="progress-track">
                      <span style={{ width: `${project.progress}%` }} />
                    </div>
                    <b>{project.progress}%</b>
                  </div>
                  <dl className="info-grid">
                    <div>
                      <dt>目前階段</dt>
                      <dd>{project.stage}</dd>
                    </div>
                    <div>
                      <dt>計畫人員</dt>
                      <dd>{project.manager}</dd>
                    </div>
                    <div>
                      <dt>研發窗口</dt>
                      <dd>{project.developers.join("、") || "未指定"}</dd>
                    </div>
                    <div>
                      <dt>期限 / 預算</dt>
                      <dd>{project.due} / {project.budget}</dd>
                    </div>
                  </dl>
                  <small className="project-count">{done}/{items.length} 小關完成</small>
                </Link>
                {editingCode === project.code ? (
                  <form className="project-card-edit-form" onSubmit={(event) => void saveProject(project, event)}>
                    <label>
                      專案名稱
                      <input name="projectName" defaultValue={project.name} required />
                    </label>
                    <label>
                      補助/機關
                      <input name="agency" defaultValue={project.agency} />
                    </label>
                    <label>
                      計畫人員
                      <input name="manager" defaultValue={project.manager} />
                    </label>
                    <label>
                      研發窗口
                      <input name="developers" defaultValue={project.developers.join("、")} />
                    </label>
                    <label>
                      總期限
                      <input name="due" defaultValue={project.due.match(/^\d{4}-\d{2}-\d{2}$/) ? project.due : ""} type="date" />
                    </label>
                    <label>
                      預算
                      <input name="budget" defaultValue={project.budget} />
                    </label>
                    <button className="primary-action" disabled={projectSavingCode === project.code} type="submit">
                      {projectSavingCode === project.code ? "儲存中" : "儲存專案"}
                    </button>
                  </form>
                ) : null}
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
