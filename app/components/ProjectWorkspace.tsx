"use client";

import Link from "next/link";
import { useMemo, useState, type DragEvent, type FormEvent } from "react";
import type { WorkflowItem } from "./flowTypes";
import { useFlowData } from "./useFlowData";

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

function latestDueDate(items: WorkflowItem[]) {
  const dates = items.map((item) => normalizeDateInput(item.dueDate)).filter(Boolean).sort();
  return dates.at(-1) ?? "";
}

function phaseState(items: WorkflowItem[]) {
  if (items.length === 0) return { className: "waiting", label: "尚未開始" };
  if (items.every((item) => item.status === "已完成")) return { className: "done", label: "已完成" };
  return { className: "active", label: "進行中" };
}

function displayDate(value: string) {
  if (!normalizeDateInput(value)) return value;
  const [year, month, day] = value.split("-");
  return `${year}/${Number(month)}/${Number(day)}`;
}

export function ProjectWorkspace({ code }: ProjectWorkspaceProps) {
  const { data, loading, message, setMessage, refresh } = useFlowData();
  const [saving, setSaving] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [addingPhase, setAddingPhase] = useState<string | null>(null);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [dropPhase, setDropPhase] = useState<string | null>(null);

  const project = data.projects.find((item) => item.code === code);
  const items = useMemo(
    () => data.workflowItems.filter((item) => item.projectCode === code),
    [code, data.workflowItems],
  );
  const sortedItems = useMemo(
    () =>
      [...items].sort((a, b) => {
        const positionDiff = (a.position ?? 0) - (b.position ?? 0);
        if (positionDiff !== 0) return positionDiff;
        return (a.createdAt ?? "").localeCompare(b.createdAt ?? "");
      }),
    [items],
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
          content: form.get("content"),
          dueDate: form.get("dueDate"),
        }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error || "新增小關失敗");
      }
      formElement.reset();
      setAddingPhase(null);
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
      dueDate: String(form.get("dueDate") || ""),
    });
    setMessage("小關內容已儲存。");
    setEditingItemId(null);
  }

  async function deleteItem(item: WorkflowItem) {
    if (!window.confirm(`確定刪除「${item.title}」？`)) return;
    setMessage("");
    const response = await fetch("/api/flow", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id }),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(result.error || "刪除小關失敗");
      return;
    }
    setEditingItemId(null);
    await refresh();
    setMessage("小關已刪除。");
  }

  async function moveItemToPhase(event: DragEvent<HTMLElement>, targetPhase: string, targetIndex?: number) {
    event.preventDefault();
    event.stopPropagation();
    const itemId = event.dataTransfer.getData("text/plain") || draggingItemId;
    const item = sortedItems.find((workflowItem) => workflowItem.id === itemId);
    setDropPhase(null);
    setDraggingItemId(null);
    if (!item) return;

    setEditingItemId(null);
    const phaseNames = [...new Set([item.phase, targetPhase])];
    const updates = phaseNames.flatMap((phaseName) => {
      const phaseItems = sortedItems.filter((workflowItem) => workflowItem.phase === phaseName && workflowItem.id !== item.id);
      if (phaseName === targetPhase) {
        const currentIndex = sortedItems.filter((workflowItem) => workflowItem.phase === targetPhase).findIndex((workflowItem) => workflowItem.id === item.id);
        const insertIndex =
          targetIndex === undefined
            ? phaseItems.length
            : item.phase === targetPhase && currentIndex > -1 && currentIndex < targetIndex
              ? targetIndex - 1
              : targetIndex;
        phaseItems.splice(Math.max(0, insertIndex), 0, { ...item, phase: targetPhase });
      }

      return phaseItems.map((workflowItem, index) => ({
        id: workflowItem.id,
        phase: phaseName,
        position: (index + 1) * 1000,
      }));
    });

    const response = await fetch("/api/flow", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "reorder-items", items: updates }),
    });
    const result = (await response.json()) as { error?: string };
    if (!response.ok) {
      setMessage(result.error || "更新小關順序失敗");
      return;
    }
    await refresh();
    setMessage(item.phase === targetPhase ? "小關順序已更新。" : `已移到「${targetPhase}」。`);
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

      {message ? <p className="form-message board-message">{message}</p> : null}

      <section className="flow-board">
        {data.phases.map((itemPhase) => {
          const phaseItems = sortedItems.filter((item) => item.phase === itemPhase);
          const phaseNumber = data.phases.indexOf(itemPhase) + 1;
          const phaseDue = latestDueDate(phaseItems);
          const state = phaseState(phaseItems);
          return (
            <article
              className={`flow-phase ${phaseClass(itemPhase)} ${dropPhase === itemPhase ? "drop-ready" : ""}`}
              key={itemPhase}
              onDragLeave={() => setDropPhase(null)}
              onDragOver={(event) => {
                event.preventDefault();
                setDropPhase(itemPhase);
              }}
              onDrop={(event) => void moveItemToPhase(event, itemPhase)}
            >
              <header className="phase-header">
                <div className="phase-title-line">
                  <span>{itemPhase}</span>
                </div>
                <div className="phase-header-actions">
                  <div className={`phase-state-pill ${state.className}`}>
                    <strong>{state.label}</strong>
                    {phaseDue ? <small>最晚 {displayDate(phaseDue)}</small> : null}
                  </div>
                  <button
                    className="phase-add-button"
                    onClick={() => {
                      setAddingPhase(addingPhase === itemPhase ? null : itemPhase);
                      setEditingItemId(null);
                    }}
                    type="button"
                  >
                    {addingPhase === itemPhase ? "收起" : "新增"}
                  </button>
                </div>
              </header>
              {addingPhase === itemPhase ? (
                <form className="phase-add-form" onSubmit={createItem}>
                  <input name="phase" type="hidden" value={itemPhase} />
                  <label>
                    小關名稱
                    <input name="title" placeholder="例如 確認技術工期與資源" required />
                  </label>
                  <label>
                    負責窗口
                    <input name="owner" placeholder="例如 Max" />
                  </label>
                  <label>
                    結束日期
                    <input name="dueDate" type="date" />
                  </label>
                  <label>
                    對應內容
                    <textarea name="content" placeholder="說明這個小關要完成什麼" />
                  </label>
                  <button className="primary-action" disabled={saving} type="submit">
                    {saving ? "新增中" : "建立小關"}
                  </button>
                </form>
              ) : null}
              {phaseItems.length === 0 ? <p className="plain-copy">尚未新增小關</p> : null}
              {phaseItems.map((item, itemIndex) => {
                const overdue = isOverdue(item);
                const isEditing = editingItemId === item.id;
                const itemCode = `${phaseNumber}-${itemIndex + 1}`;
                return (
                  <div
                    className={`flow-item ${overdue ? "overdue" : ""} ${draggingItemId === item.id ? "dragging" : ""}`}
                    draggable={!isEditing}
                    key={item.id}
                    onDragEnd={() => {
                      setDraggingItemId(null);
                      setDropPhase(null);
                    }}
                    onDragStart={(event) => {
                      setDraggingItemId(item.id);
                      event.dataTransfer.effectAllowed = "move";
                      event.dataTransfer.setData("text/plain", item.id);
                    }}
                    onDragOver={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      setDropPhase(itemPhase);
                    }}
                    onDrop={(event) => void moveItemToPhase(event, itemPhase, itemIndex)}
                  >
                    <div className="flow-item-head">
                      <div className="flow-item-idline">
                        <strong>{itemCode}</strong>
                      </div>
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
                            期限
                            <input name="dueDate" defaultValue={normalizeDateInput(item.dueDate)} type="date" />
                          </label>
                          <div className="edit-actions">
                            <button className="danger-action" onClick={() => void deleteItem(item)} type="button">刪除小關</button>
                            <button className="secondary-action" type="submit">儲存小關</button>
                          </div>
                        </form>
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
