"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import type { WorkflowItem } from "./flowTypes";
import { useFlowData } from "./useFlowData";

const roles = ["專案管理人員", "研發人員", "管理層"];
const statuses = ["未處理", "進行中", "已完成"];

type ProjectWorkspaceProps = {
  code: string;
};

function statusClass(status: string) {
  if (status === "已完成") return "done";
  if (status === "進行中") return "active";
  return "waiting";
}

function phaseClass(phase: string) {
  if (phase === "提案") return "phase-proposal";
  if (phase === "啟動") return "phase-launch";
  if (phase === "期中") return "phase-midterm";
  return "phase-close";
}

function normalizeDateInput(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) ? value : "";
}

function isOverdue(item: WorkflowItem) {
  if (item.status === "已完成") return false;
  if (!normalizeDateInput(item.dueDate)) return false;
  const today = new Date();
  const todayKey = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().slice(0, 10);
  return item.dueDate < todayKey;
}

export function ProjectWorkspace({ code }: ProjectWorkspaceProps) {
  const { data, loading, message, setMessage, refresh } = useFlowData();
  const [phase, setPhase] = useState("提案");
  const [saving, setSaving] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  const project = data.projects.find((item) => item.code === code);
  const items = useMemo(
    () => data.workflowItems.filter((item) => item.projectCode === code),
    [code, data.workflowItems],
  );

  async function createItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    if (!project) return;
    setSaving(true);
    setMessage("");

    const form = new FormData(formElement);
    try {
      const response = await fetch("/api/flow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create-item",
          projectCode: project.code,
          projectName: project.name,
          phase: form.get("phase"),
          title: form.get("title"),
          owner: form.get("owner"),
          role: form.get("role"),
          content: form.get("content"),
          dueDate: form.get("dueDate"),
          documentUrl: form.get("documentUrl"),
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error || "新增小關失敗");
      }
      formElement.reset();
      setPhase("提案");
      await refresh();
      setMessage("小關已新增。");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "新增小關失敗");
    } finally {
      setSaving(false);
    }
  }

  async function updateItem(item: WorkflowItem, patch: Partial<WorkflowItem>) {
    setMessage("");
    const response = await fetch("/api/flow", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, ...patch }),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(result.error || "更新小關失敗");
      return;
    }
    await refresh();
  }

  async function saveEditedItem(item: WorkflowItem, form: FormData) {
    await updateItem(item, {
      title: String(form.get("title") || ""),
      phase: String(form.get("phase") || ""),
      owner: String(form.get("owner") || ""),
      role: String(form.get("role") || ""),
      dueDate: String(form.get("dueDate") || ""),
      content: String(form.get("content") || ""),
      documentUrl: String(form.get("documentUrl") || ""),
    });
    setMessage("小關內容已儲存。");
    setEditingItemId(null);
  }

  if (loading) {
    return <p className="plain-copy">讀取專案工作台中...</p>;
  }

  if (!project) {
    return (
      <section className="panel empty-state">
        <h2>找不到這個專案</h2>
        <p>可能尚未建立，或專案代號已變更。</p>
        <Link className="primary-action" href="/projects">回專案列表</Link>
      </section>
    );
  }

  const done = items.filter((item) => item.status === "已完成").length;

  return (
    <div className="workspace-stack">
      <section className="project-hero panel">
        <div>
          <span>{project.code}</span>
          <h2>{project.name}</h2>
          <p>{project.agency} / 計畫人員：{project.manager} / 研發：{project.developers.join("、") || "未指定"}</p>
        </div>
        <div className="hero-progress">
          <strong>{project.progress}%</strong>
          <div className="progress-track">
            <span style={{ width: `${project.progress}%` }} />
          </div>
          <small>{done}/{items.length} 小關完成，目前在「{project.stage}」</small>
        </div>
      </section>

      <section className="panel">
        <div className="section-title">
          <div>
            <p>新增小關</p>
            <h2>每次開會後，把後續要做的事拆成可追蹤節點</h2>
          </div>
        </div>
        <form className="meeting-form project-form" onSubmit={createItem}>
          <label>
            階段
            <select name="phase" onChange={(event) => setPhase(event.target.value)} value={phase}>
              {data.phases.map((itemPhase) => (
                <option key={itemPhase}>{itemPhase}</option>
              ))}
            </select>
          </label>
          <label>
            小關名稱
            <input name="title" placeholder="例如 確認技術工期與資源" required />
          </label>
          <label>
            負責窗口
            <input name="owner" placeholder="例如 Max" />
          </label>
          <label>
            角色
            <select name="role" defaultValue="研發人員">
              {roles.map((role) => (
                <option key={role}>{role}</option>
              ))}
            </select>
          </label>
          <label>
            結束日期
            <input name="dueDate" type="date" />
          </label>
          <label className="wide-field">
            文件或 Google 連結
            <input name="documentUrl" placeholder="https://docs.google.com/..." />
          </label>
          <label className="wide-field">
            對應內容
            <textarea name="content" placeholder="說明這個小關要完成什麼、方向是什麼、驗收重點是什麼" />
          </label>
          <button className="primary-action" disabled={saving} type="submit">
            {saving ? "新增中" : "新增小關"}
          </button>
        </form>
        {message ? <p className="form-message left">{message}</p> : null}
      </section>

      <section className="flow-board">
        {data.phases.map((itemPhase) => {
          const phaseItems = items.filter((item) => item.phase === itemPhase);
          return (
            <article className={`flow-phase ${phaseClass(itemPhase)}`} key={itemPhase}>
              <header className="phase-header">
                <span>{itemPhase}</span>
                <strong>{phaseItems.filter((item) => item.status === "已完成").length}/{phaseItems.length}</strong>
              </header>
              {phaseItems.length === 0 ? <p className="plain-copy">尚未新增小關</p> : null}
              {phaseItems.map((item) => {
                const overdue = isOverdue(item);
                const isEditing = editingItemId === item.id;
                return (
                  <div className={`flow-item ${overdue ? "overdue" : ""}`} key={item.id}>
                    <div className="flow-item-head">
                      <span>{item.role}</span>
                      <div className="flow-status-line">
                        <b className={statusClass(item.status)}>{item.status}</b>
                        <strong className={`due-pill ${overdue ? "overdue" : ""}`}>期限 {item.dueDate}</strong>
                      </div>
                    </div>
                    <h3>{item.title}</h3>
                    <div className="compact-meta">
                      <span>窗口：{item.owner}</span>
                      <span>文件：{item.documentUrl ? "已提供" : "未提供"}</span>
                      {item.completedAt ? <span>完成：{item.completedAt}</span> : null}
                    </div>
                    <section className="rd-content-preview">
                      <span>研發填報內容</span>
                      <p>{item.content === "待補內容" ? "尚未填寫" : item.content}</p>
                    </section>
                    <div className="compact-actions">
                      {item.documentUrl ? (
                        <a className="doc-link" href={item.documentUrl} rel="noreferrer" target="_blank">
                          開啟文件
                        </a>
                      ) : null}
                      <button
                        className="secondary-action"
                        onClick={() => setEditingItemId(isEditing ? null : item.id)}
                        type="button"
                      >
                        {isEditing ? "收起" : "編輯"}
                      </button>
                    </div>
                    {isEditing ? (
                      <>
                        <form
                          className="inline-edit-form"
                          onSubmit={(event) => {
                            event.preventDefault();
                            void saveEditedItem(item, new FormData(event.currentTarget));
                          }}
                        >
                          <label>
                            小關名稱
                            <input name="title" defaultValue={item.title} />
                          </label>
                          <label>
                            階段
                            <select name="phase" defaultValue={item.phase}>
                              {data.phases.map((itemPhaseOption) => (
                                <option key={itemPhaseOption}>{itemPhaseOption}</option>
                              ))}
                            </select>
                          </label>
                          <label>
                            負責窗口
                            <input name="owner" defaultValue={item.owner} />
                          </label>
                          <label>
                            角色
                            <select name="role" defaultValue={item.role}>
                              {roles.map((role) => (
                                <option key={role}>{role}</option>
                              ))}
                            </select>
                          </label>
                          <label>
                            期限
                            <input name="dueDate" defaultValue={normalizeDateInput(item.dueDate)} type="date" />
                          </label>
                          <label className="wide-field">
                            研發填報內容
                            <textarea name="content" defaultValue={item.content === "待補內容" ? "" : item.content} />
                          </label>
                          <label className="wide-field">
                            文件或 Google 連結
                            <input name="documentUrl" defaultValue={item.documentUrl} placeholder="貼上 Google 文件或雲端連結" />
                          </label>
                          <button className="secondary-action" type="submit">儲存小關</button>
                        </form>
                        <div className="flow-actions">
                          {statuses.map((status) => (
                            <button
                              className={status === item.status ? "primary-action" : "secondary-action"}
                              key={status}
                              onClick={() => void updateItem(item, { status })}
                              type="button"
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </>
                    ) : null}
                  </div>
                );
              })}
            </article>
          );
        })}
      </section>
    </div>
  );
}
