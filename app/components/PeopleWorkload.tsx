"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { WorkflowItem } from "./flowTypes";
import { useFlowData } from "./useFlowData";

const statuses = ["未處理", "進行中", "已完成"];
const defaultPhases = ["提案", "啟動", "期中", "期末"];
const reportEntryMarker = "__RD_REPORT_ENTRIES_V1__";
const allOwnersLabel = "全部填報人";

type ReportEntry = {
  content: string;
  link: string;
};

function splitOwners(value: string) {
  return (value || "未指定")
    .split(/、|,|，|\r?\n/)
    .map((name) => name.trim())
    .filter(Boolean);
}

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

function parseReportEntries(item: WorkflowItem): ReportEntry[] {
  if (item.content.startsWith(reportEntryMarker)) {
    try {
      const parsed = JSON.parse(item.content.slice(reportEntryMarker.length));
      if (Array.isArray(parsed)) {
        const entries = parsed
          .map((entry) => ({
            content: typeof entry.content === "string" ? entry.content : "",
            link: typeof entry.link === "string" ? entry.link : "",
          }))
          .filter((entry) => entry.content.trim() || entry.link.trim());
        return entries.length > 0 ? entries : [{ content: "", link: "" }];
      }
    } catch {
      return [{ content: item.content, link: item.documentUrl }];
    }
  }

  return [
    {
      content: item.content === "待補內容" ? "" : item.content,
      link: item.documentUrl,
    },
  ];
}

function serializeReportEntries(entries: ReportEntry[]) {
  const cleanEntries = entries
    .map((entry) => ({ content: entry.content.trim(), link: entry.link.trim() }))
    .filter((entry) => entry.content || entry.link);
  return cleanEntries.length > 0 ? `${reportEntryMarker}${JSON.stringify(cleanEntries)}` : "待補內容";
}

function firstReportLink(entries: ReportEntry[]) {
  return entries.find((entry) => entry.link.trim())?.link.trim() ?? "";
}

function hasReportLink(item: WorkflowItem) {
  return parseReportEntries(item).some((entry) => entry.link.trim()) || Boolean(item.documentUrl);
}

function ReportEntryEditor({
  item,
  onSave,
  saving,
}: {
  item: WorkflowItem;
  onSave: (item: WorkflowItem, patch: Partial<WorkflowItem>) => void;
  saving: boolean;
}) {
  const [entries, setEntries] = useState<ReportEntry[]>(() => parseReportEntries(item));
  const [entryMessage, setEntryMessage] = useState("");

  useEffect(() => {
    setEntries(parseReportEntries(item));
    setEntryMessage("");
  }, [item.id, item.content, item.documentUrl]);

  function updateEntry(index: number, patch: Partial<ReportEntry>) {
    setEntries((current) => current.map((entry, entryIndex) => (entryIndex === index ? { ...entry, ...patch } : entry)));
  }

  function removeEntry(index: number) {
    setEntries((current) => {
      if (current.length === 1) {
        setEntryMessage("至少需要保留一筆內容與連結。");
        return current;
      }
      setEntryMessage("");
      return current.filter((_, entryIndex) => entryIndex !== index);
    });
  }

  return (
    <div className="report-entry-editor">
      {entries.map((entry, index) => (
        <section className="report-entry-row" key={`${item.id}-${index}`}>
          <div className="report-entry-head">
            <strong>內容 {index + 1}</strong>
            <button className="text-danger-button" onClick={() => removeEntry(index)} type="button">
              刪除
            </button>
          </div>
          <label>
            研發填報內容
            <textarea
              onChange={(event) => updateEntry(index, { content: event.currentTarget.value })}
              placeholder="寫下目前完成內容、討論結論、測試結果或需要 PM 知道的方向"
              value={entry.content}
            />
          </label>
          <label>
            文件或 Google 連結
            <input
              onChange={(event) => updateEntry(index, { link: event.currentTarget.value })}
              placeholder="貼上成果文件連結"
              value={entry.link}
            />
          </label>
        </section>
      ))}
      {entryMessage ? <p className="entry-warning">{entryMessage}</p> : null}
      <div className="report-entry-actions">
        <button className="secondary-action" onClick={() => setEntries((current) => [...current, { content: "", link: "" }])} type="button">
          ＋ 新增內容與連結
        </button>
        <button
          className="primary-action"
          disabled={saving}
          onClick={() => onSave(item, { content: serializeReportEntries(entries), documentUrl: firstReportLink(entries) })}
          type="button"
        >
          儲存填報
        </button>
      </div>
    </div>
  );
}

export function PeopleWorkload() {
  const { data, loading, message, setMessage, refresh } = useFlowData();
  const [owner, setOwner] = useState(allOwnersLabel);
  const [projectCode, setProjectCode] = useState("全部專案");
  const [statusFilter, setStatusFilter] = useState("全部狀態");
  const [savingId, setSavingId] = useState("");
  const [editingId, setEditingId] = useState("");

  const owners = useMemo(() => {
    const names = data.workflowItems.flatMap((item) => splitOwners(item.owner));
    return [allOwnersLabel, ...Array.from(new Set(names))];
  }, [data.workflowItems]);

  const projectOptions = useMemo(() => {
    return ["全部專案", ...data.projects.map((project) => project.code)];
  }, [data.projects]);

  const projectNameByCode = useMemo(() => {
    return new Map(data.projects.map((project) => [project.code, project.name]));
  }, [data.projects]);

  const scopedItems = useMemo(() => {
    return data.workflowItems
      .filter((item) => owner === allOwnersLabel || splitOwners(item.owner).includes(owner))
      .filter((item) => projectCode === "全部專案" || item.projectCode === projectCode);
  }, [data.workflowItems, owner, projectCode]);

  const summary = useMemo(() => {
    return {
      all: scopedItems.length,
      waiting: scopedItems.filter((item) => item.status === "未處理").length,
      active: scopedItems.filter((item) => item.status === "進行中").length,
      done: scopedItems.filter((item) => item.status === "已完成").length,
      missingDocs: scopedItems.filter((item) => !hasReportLink(item)).length,
    };
  }, [scopedItems]);

  const visibleItems = useMemo(() => {
    return scopedItems
      .filter((item) => statusFilter === "全部狀態" || item.status === statusFilter)
      .sort((a, b) => {
        if (a.status === "已完成" && b.status !== "已完成") return 1;
        if (a.status !== "已完成" && b.status === "已完成") return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
  }, [scopedItems, statusFilter]);

  const phases = data.phases.length > 0 ? data.phases : defaultPhases;

  async function updateItem(item: WorkflowItem, patch: Partial<WorkflowItem>) {
    setSavingId(item.id);
    setMessage("");
    try {
      const response = await fetch("/api/flow", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, ...patch }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error || "更新失敗");
      }
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "更新失敗");
    } finally {
      setSavingId("");
    }
  }

  return (
    <>
      {message ? <p className="form-message left">{message}</p> : null}
      {loading ? <p className="plain-copy">讀取研發填報中...</p> : null}

      <section className="rd-toolbar panel">
        <div>
          <p>篩選填報內容</p>
        </div>
        <div className="rd-filter-controls">
          <label>
            專案
            <select aria-label="選擇專案" onChange={(event) => setProjectCode(event.target.value)} value={projectCode}>
              {projectOptions.map((code) => (
                <option key={code} value={code}>
                  {code === "全部專案" ? code : projectNameByCode.get(code) ?? code}
                </option>
              ))}
            </select>
          </label>
          <label>
            填報人員
            <select aria-label="選擇填報人員" onChange={(event) => setOwner(event.target.value)} value={owner}>
              {owners.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <section className="rd-status-summary" aria-label="研發填報狀態分析">
        <button
          className={statusFilter === "全部狀態" ? "rd-summary-card all selected" : "rd-summary-card all"}
          onClick={() => setStatusFilter("全部狀態")}
          type="button"
        >
          <span>全部</span>
          <strong>{summary.all}</strong>
          <small>目前篩選後的小關</small>
        </button>
        <button
          className={statusFilter === "未處理" ? "rd-summary-card waiting selected" : "rd-summary-card waiting"}
          onClick={() => setStatusFilter("未處理")}
          type="button"
        >
          <span>未處理</span>
          <strong>{summary.waiting}</strong>
          <small>還沒開始，優先確認方向</small>
        </button>
        <button
          className={statusFilter === "進行中" ? "rd-summary-card active selected" : "rd-summary-card active"}
          onClick={() => setStatusFilter("進行中")}
          type="button"
        >
          <span>進行中</span>
          <strong>{summary.active}</strong>
          <small>正在製作或整理資料</small>
        </button>
        <button
          className={statusFilter === "已完成" ? "rd-summary-card done selected" : "rd-summary-card done"}
          onClick={() => setStatusFilter("已完成")}
          type="button"
        >
          <span>已完成</span>
          <strong>{summary.done}</strong>
          <small>已填報完成</small>
        </button>
        <button className="rd-summary-card missing" onClick={() => setStatusFilter("全部狀態")} type="button">
          <span>缺文件</span>
          <strong>{summary.missingDocs}</strong>
          <small>還沒貼成果連結</small>
        </button>
      </section>

      {!loading && scopedItems.length === 0 ? (
        <section className="panel empty-state">
          <h2>目前還沒有可填報的小關</h2>
          <p>請先由計畫人員在「專案管理」新增小關，並填入負責窗口。</p>
          <Link className="primary-action" href="/projects">前往專案管理</Link>
        </section>
      ) : null}

      <section className="rd-phase-board">
        {phases.map((phase) => {
          const phaseItems = visibleItems.filter((item) => item.phase === phase);
          return (
            <article className={`rd-phase-column ${phaseClass(phase)}`} key={phase}>
              <header>
                <span>{phase}</span>
                <strong>{phaseItems.length}</strong>
              </header>
              {phaseItems.length === 0 ? <p className="plain-copy">目前沒有小關</p> : null}
              {phaseItems.map((item) => {
                const itemStatusClass = statusClass(item.status);
                const isEditing = editingId === item.id;
                const reportEntries = parseReportEntries(item);
                const reportLinks = reportEntries.filter((entry) => entry.link.trim());
                const itemHasLink = reportLinks.length > 0 || Boolean(item.documentUrl);
                const currentReporter = owner === allOwnersLabel ? splitOwners(item.owner).join("、") : owner;
                return (
                  <div className={`rd-task-card status-${itemStatusClass}`} key={item.id}>
                    <header>
                      <span>{item.projectName}</span>
                      <b className={itemStatusClass}>{item.status}</b>
                    </header>
                    <h2>{item.title}</h2>
                    <div className="compact-meta">
                      <span>{owner === allOwnersLabel ? "指派：" : "填報人："}{currentReporter || "未指定"}</span>
                      <span>期限：{item.dueDate}</span>
                      <span className={itemHasLink ? "doc-ok" : "doc-missing"}>
                        文件：{itemHasLink ? "已有連結" : "缺文件"}
                      </span>
                    </div>
                    <section className="rd-content-preview">
                      <span>研發填報內容</span>
                      {reportEntries.some((entry) => entry.content.trim()) ? (
                        reportEntries.map((entry, index) =>
                          entry.content.trim() ? <p key={`${item.id}-preview-${index}`}>{entry.content}</p> : null,
                        )
                      ) : (
                        <p>尚未填寫</p>
                      )}
                    </section>
                    <div className="compact-actions">
                      {reportLinks.slice(0, 2).map((entry, index) => (
                        <a className="doc-link" href={entry.link} key={`${item.id}-link-${index}`} rel="noreferrer" target="_blank">
                          開啟文件{reportLinks.length > 1 ? index + 1 : ""}
                        </a>
                      ))}
                      <button className="secondary-action" onClick={() => setEditingId(isEditing ? "" : item.id)} type="button">
                        {isEditing ? "收起" : "編輯"}
                      </button>
                    </div>
                    {isEditing ? (
                      <div className="rd-edit-panel">
                        <ReportEntryEditor item={item} onSave={(targetItem, patch) => void updateItem(targetItem, patch)} saving={savingId === item.id} />
                        <div className="rd-actions">
                          {statuses.map((status) => (
                            <button
                              className={status === item.status ? "primary-action" : "secondary-action"}
                              disabled={savingId === item.id}
                              key={status}
                              onClick={() => void updateItem(item, { status })}
                              type="button"
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </article>
          );
        })}
      </section>
    </>
  );
}
