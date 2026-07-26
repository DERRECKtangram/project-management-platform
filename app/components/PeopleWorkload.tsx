"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { WorkflowItem } from "./flowTypes";
import { useFlowData } from "./useFlowData";

const statuses = ["未處理", "進行中", "已完成"];
const defaultPhases = ["提案", "啟動", "期中", "期末"];
const reportEntryMarker = "__RD_REPORT_ENTRIES_V1__";
const workflowContentMarker = "__WORKFLOW_CONTENT_V2__";
const allOwnersLabel = "全部填報人";

type ReportEntry = {
  content: string;
  link: string;
};

type PersonReport = {
  status: string;
  entries: ReportEntry[];
};

type WorkflowContent = {
  taskContent: string;
  taskLinks: string[];
  reportEntries: ReportEntry[];
  reportsByOwner: Record<string, PersonReport>;
};

type ReportCard = {
  item: WorkflowItem;
  reporter: string;
  key: string;
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

function normalizeReportStatus(status?: string) {
  if (status === "已完成") return "已完成";
  if (status === "進行中") return "進行中";
  return "未處理";
}

function phaseClass(phase: string) {
  if (phase === "提案") return "phase-proposal";
  if (phase === "啟動") return "phase-launch";
  if (phase === "期中") return "phase-midterm";
  return "phase-close";
}

function parseLegacyReportEntries(value: string, documentUrl = "") {
  try {
    const parsed = JSON.parse(value.slice(reportEntryMarker.length));
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
    return [{ content: value, link: documentUrl }];
  }
  return [{ content: "", link: "" }];
}

function parseWorkflowContent(item: WorkflowItem): WorkflowContent {
  if (item.content.startsWith(workflowContentMarker)) {
    try {
      const parsed = JSON.parse(item.content.slice(workflowContentMarker.length));
      const reportsByOwner =
        parsed.reportsByOwner && typeof parsed.reportsByOwner === "object"
          ? Object.fromEntries(
              Object.entries(parsed.reportsByOwner).map(([person, report]) => {
                const typedReport = report as { status?: unknown; entries?: unknown };
                return [
                  person,
                  {
                    status: normalizeReportStatus(typeof typedReport.status === "string" ? typedReport.status : ""),
                    entries: Array.isArray(typedReport.entries)
                      ? typedReport.entries
                          .map((entry: { content?: unknown; link?: unknown }) => ({
                            content: typeof entry.content === "string" ? entry.content : "",
                            link: typeof entry.link === "string" ? entry.link : "",
                          }))
                          .filter((entry: ReportEntry) => entry.content.trim() || entry.link.trim())
                      : [],
                  },
                ];
              }),
            )
          : {};
      return {
        taskContent: typeof parsed.taskContent === "string" ? parsed.taskContent : "",
        taskLinks: Array.isArray(parsed.taskLinks) ? parsed.taskLinks.filter((link: unknown) => typeof link === "string") : [],
        reportEntries: Array.isArray(parsed.reportEntries)
          ? parsed.reportEntries
              .map((entry: { content?: unknown; link?: unknown }) => ({
                content: typeof entry.content === "string" ? entry.content : "",
                link: typeof entry.link === "string" ? entry.link : "",
              }))
              .filter((entry: ReportEntry) => entry.content.trim() || entry.link.trim())
          : [],
        reportsByOwner,
      };
    } catch {
      return { taskContent: "", taskLinks: [], reportEntries: [{ content: "", link: "" }], reportsByOwner: {} };
    }
  }

  if (item.content.startsWith(reportEntryMarker)) {
    return { taskContent: "", taskLinks: [], reportEntries: parseLegacyReportEntries(item.content, item.documentUrl), reportsByOwner: {} };
  }

  return {
    taskContent: item.content === "待補內容" ? "" : item.content,
    taskLinks: item.documentUrl ? [item.documentUrl] : [],
    reportEntries: [{ content: "", link: "" }],
    reportsByOwner: {},
  };
}

function entriesWithFallback(entries: ReportEntry[]) {
  return entries.length > 0 ? entries : [{ content: "", link: "" }];
}

function cleanReportEntries(entries: ReportEntry[]) {
  return entries
    .map((entry) => ({ content: entry.content.trim(), link: entry.link.trim() }))
    .filter((entry) => entry.content || entry.link);
}

function getOwnerReport(item: WorkflowItem, reporter: string): PersonReport {
  const current = parseWorkflowContent(item);
  if (reporter !== allOwnersLabel) {
    const ownerReport = current.reportsByOwner[reporter];
    if (ownerReport) {
      return { status: normalizeReportStatus(ownerReport.status), entries: entriesWithFallback(ownerReport.entries) };
    }
    if (current.reportEntries.some((entry) => entry.content.trim() || entry.link.trim())) {
      return { status: normalizeReportStatus(item.status), entries: entriesWithFallback(current.reportEntries) };
    }
  } else {
    const allEntries = [
      ...current.reportEntries,
      ...Object.entries(current.reportsByOwner).flatMap(([person, report]) =>
        report.entries.map((entry) => ({
          content: entry.content.trim() ? `${person}：${entry.content}` : "",
          link: entry.link,
        })),
      ),
    ].filter((entry) => entry.content.trim() || entry.link.trim());
    if (allEntries.length > 0) {
      return { status: normalizeReportStatus(item.status), entries: allEntries };
    }
  }

  return {
    status: normalizeReportStatus(item.status),
    entries: entriesWithFallback(current.reportEntries),
  };
}

function summarizeOwnerStatus(item: WorkflowItem, reporter: string) {
  return reporter === allOwnersLabel ? normalizeReportStatus(item.status) : getOwnerReport(item, reporter).status;
}

function ownerHasReportLink(item: WorkflowItem, reporter: string) {
  if (reporter === allOwnersLabel) {
    const current = parseWorkflowContent(item);
    return (
      current.reportEntries.some((entry) => entry.link.trim()) ||
      Object.values(current.reportsByOwner).some((report) => report.entries.some((entry) => entry.link.trim()))
    );
  }
  return getOwnerReport(item, reporter).entries.some((entry) => entry.link.trim());
}

function aggregateItemStatus(item: WorkflowItem, reportsByOwner: Record<string, PersonReport>) {
  const owners = splitOwners(item.owner);
  if (owners.length === 0) return normalizeReportStatus(item.status);
  const ownerStatuses = owners.map((person) => normalizeReportStatus(reportsByOwner[person]?.status));
  if (ownerStatuses.every((status) => status === "已完成")) return "已完成";
  if (ownerStatuses.some((status) => status === "進行中" || status === "已完成")) return "進行中";
  return "未處理";
}

function serializeWorkflowContent(content: WorkflowContent) {
  const cleanReportsByOwner = Object.fromEntries(
    Object.entries(content.reportsByOwner).map(([person, report]) => [
      person,
      {
        status: normalizeReportStatus(report.status),
        entries: cleanReportEntries(report.entries),
      },
    ]),
  );
  return `${workflowContentMarker}${JSON.stringify({
    taskContent: content.taskContent.trim(),
    taskLinks: content.taskLinks.map((link) => link.trim()).filter(Boolean),
    reportEntries: cleanReportEntries(content.reportEntries),
    reportsByOwner: cleanReportsByOwner,
  })}`;
}

function firstReportLinkFromContent(content: WorkflowContent) {
  return (
    Object.values(content.reportsByOwner)
      .flatMap((report) => report.entries)
      .find((entry) => entry.link.trim())?.link.trim() ??
    content.reportEntries.find((entry) => entry.link.trim())?.link.trim() ??
    ""
  );
}

function hasReportLink(item: WorkflowItem) {
  return ownerHasReportLink(item, allOwnersLabel);
}

function ReportEntryEditor({
  item,
  onSave,
  reporter,
  saving,
}: {
  item: WorkflowItem;
  onSave: (item: WorkflowItem, patch: Partial<WorkflowItem>) => void;
  reporter: string;
  saving: boolean;
}) {
  const [entries, setEntries] = useState<ReportEntry[]>(() => getOwnerReport(item, reporter).entries);
  const [entryMessage, setEntryMessage] = useState("");

  useEffect(() => {
    setEntries(getOwnerReport(item, reporter).entries);
    setEntryMessage("");
  }, [item.id, item.content, item.documentUrl, reporter]);

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
          onClick={() => {
            const current = parseWorkflowContent(item);
            const reportsByOwner = {
              ...current.reportsByOwner,
              [reporter]: {
                status: getOwnerReport(item, reporter).status,
                entries,
              },
            };
            const nextContent = { ...current, reportsByOwner };
            onSave(item, { content: serializeWorkflowContent(nextContent), documentUrl: firstReportLinkFromContent(nextContent) });
          }}
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

  const phases = data.phases.length > 0 ? data.phases : defaultPhases;

  const scopedItems = useMemo(() => {
    return data.workflowItems.filter((item) => projectCode === "全部專案" || item.projectCode === projectCode);
  }, [data.workflowItems, projectCode]);

  const reportCards = useMemo<ReportCard[]>(() => {
    return scopedItems.flatMap((item) => {
      const assignedOwners = splitOwners(item.owner);
      const ownersForItem = assignedOwners.length > 0 ? assignedOwners : ["未指定"];
      return ownersForItem
        .filter((reporter) => owner === allOwnersLabel || reporter === owner)
        .map((reporter) => ({
          item,
          reporter,
          key: `${item.id}::${reporter}`,
        }));
    });
  }, [owner, scopedItems]);

  const summary = useMemo(() => {
    return {
      all: reportCards.length,
      waiting: reportCards.filter((card) => summarizeOwnerStatus(card.item, card.reporter) === "未處理").length,
      active: reportCards.filter((card) => summarizeOwnerStatus(card.item, card.reporter) === "進行中").length,
      done: reportCards.filter((card) => summarizeOwnerStatus(card.item, card.reporter) === "已完成").length,
      missingDocs: reportCards.filter((card) => !ownerHasReportLink(card.item, card.reporter)).length,
    };
  }, [reportCards]);

  const itemRankById = useMemo(() => {
    const ranks = new Map<string, number>();
    const phaseNumberByName = new Map(phases.map((phase, index) => [phase, index + 1]));
    data.projects.forEach((project, projectIndex) => {
      phases.forEach((phase) => {
        data.workflowItems
          .filter((item) => item.projectCode === project.code && item.phase === phase)
          .sort((a, b) => {
            const positionDiff = (a.position ?? 0) - (b.position ?? 0);
            if (positionDiff !== 0) return positionDiff;
            return (a.createdAt ?? "").localeCompare(b.createdAt ?? "");
          })
          .forEach((item, index) => {
            const phaseNumber = phaseNumberByName.get(phase) ?? 1;
            ranks.set(item.id, projectIndex * 1000000 + phaseNumber * 10000 + index);
          });
      });
    });
    return ranks;
  }, [data.projects, data.workflowItems, phases]);

  const visibleCards = useMemo(() => {
    return reportCards
      .filter((card) => statusFilter === "全部狀態" || summarizeOwnerStatus(card.item, card.reporter) === statusFilter)
      .sort((a, b) => {
        const rankDiff = (itemRankById.get(a.item.id) ?? 0) - (itemRankById.get(b.item.id) ?? 0);
        if (rankDiff !== 0) return rankDiff;
        return a.reporter.localeCompare(b.reporter);
      });
  }, [itemRankById, reportCards, statusFilter]);

  const itemCodeById = useMemo(() => {
    const phaseNumberByName = new Map(phases.map((phase, index) => [phase, index + 1]));
    const codes = new Map<string, string>();
    data.projects.forEach((project) => {
      phases.forEach((phase) => {
        data.workflowItems
          .filter((item) => item.projectCode === project.code && item.phase === phase)
          .sort((a, b) => {
            const positionDiff = (a.position ?? 0) - (b.position ?? 0);
            if (positionDiff !== 0) return positionDiff;
            return (a.createdAt ?? "").localeCompare(b.createdAt ?? "");
          })
          .forEach((item, index) => {
            codes.set(item.id, `${phaseNumberByName.get(phase) ?? 1}-${index + 1}`);
          });
      });
    });
    return codes;
  }, [data.projects, data.workflowItems, phases]);

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

  async function updateOwnerStatus(item: WorkflowItem, reporter: string, status: string) {
    if (reporter === allOwnersLabel) {
      setMessage("請先選擇一位填報人員，再更新個人進度。");
      return;
    }

    const current = parseWorkflowContent(item);
    const currentReport = getOwnerReport(item, reporter);
    const reportsByOwner = {
      ...current.reportsByOwner,
      [reporter]: {
        ...currentReport,
        status: normalizeReportStatus(status),
      },
    };
    const nextContent = { ...current, reportsByOwner };
    await updateItem(item, {
      status: aggregateItemStatus(item, reportsByOwner),
      content: serializeWorkflowContent(nextContent),
      documentUrl: firstReportLinkFromContent(nextContent),
    });
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
          <small>目前篩選後的填報卡</small>
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

      {!loading && reportCards.length === 0 ? (
        <section className="panel empty-state">
          <h2>目前還沒有可填報的小關</h2>
          <p>請先由計畫人員在「專案管理」新增小關，並填入負責窗口。</p>
          <Link className="primary-action" href="/projects">前往專案管理</Link>
        </section>
      ) : null}

      <section className="rd-phase-board">
        {phases.map((phase) => {
          const phaseCards = visibleCards.filter((card) => card.item.phase === phase);
          return (
            <article className={`rd-phase-column ${phaseClass(phase)}`} key={phase}>
              <header>
                <span>{phase}</span>
                <strong>{phaseCards.length}</strong>
              </header>
              {phaseCards.length === 0 ? <p className="plain-copy">目前沒有填報卡</p> : null}
              {phaseCards.map((card) => {
                const { item, reporter } = card;
                const itemStatus = summarizeOwnerStatus(item, reporter);
                const itemStatusClass = statusClass(itemStatus);
                const isEditing = editingId === card.key;
                const workflowContent = parseWorkflowContent(item);
                const reportEntries = getOwnerReport(item, reporter).entries;
                const reportLinks = reportEntries.filter((entry) => entry.link.trim());
                const itemHasLink = ownerHasReportLink(item, reporter);
                const itemCode = itemCodeById.get(item.id) ?? `${phases.indexOf(item.phase) + 1}-?`;
                return (
                  <div className={`rd-task-card status-${itemStatusClass}`} key={card.key}>
                    <header>
                      <span>{item.projectName}</span>
                      <div className="rd-card-badges">
                        <em>{item.phase} {itemCode}</em>
                        <b className={itemStatusClass}>{itemStatus}</b>
                      </div>
                    </header>
                    <h2>{item.title}</h2>
                    <div className="compact-meta">
                      <span>填報人：{reporter || "未指定"}</span>
                      <span>期限：{item.dueDate}</span>
                      <span className={itemHasLink ? "doc-ok" : "doc-missing"}>
                        文件：{itemHasLink ? "已有連結" : "缺文件"}
                      </span>
                    </div>
                    <section className="task-content-preview">
                      <span>要做的內容</span>
                      <p>{workflowContent.taskContent.trim() || "尚未填寫"}</p>
                      {workflowContent.taskLinks.length > 0 ? (
                        <div className="task-link-list">
                          {workflowContent.taskLinks.slice(0, 3).map((link, index) => (
                            <a href={link} key={`${item.id}-task-reference-${index}`} rel="noreferrer" target="_blank">
                              參考連結{workflowContent.taskLinks.length > 1 ? index + 1 : ""}
                            </a>
                          ))}
                        </div>
                      ) : null}
                    </section>
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
                      <button className="secondary-action" onClick={() => setEditingId(isEditing ? "" : card.key)} type="button">
                        {isEditing ? "收起" : "編輯"}
                      </button>
                    </div>
                    {isEditing ? (
                      <div className="rd-edit-panel">
                        <ReportEntryEditor
                          item={item}
                          onSave={(targetItem, patch) => void updateItem(targetItem, patch)}
                          reporter={reporter}
                          saving={savingId === item.id}
                        />
                        <div className="rd-actions">
                          {statuses.map((status) => (
                            <button
                              className={status === itemStatus ? "primary-action" : "secondary-action"}
                              disabled={savingId === item.id}
                              key={status}
                              onClick={() => void updateOwnerStatus(item, reporter, status)}
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
