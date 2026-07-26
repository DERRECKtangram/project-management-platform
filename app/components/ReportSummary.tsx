"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { WorkflowItem } from "./flowTypes";
import { useFlowData } from "./useFlowData";

const workflowContentMarker = "__WORKFLOW_CONTENT_V2__";
const reportEntryMarker = "__RD_REPORT_ENTRIES_V1__";

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

function splitOwners(value: string) {
  return (value || "")
    .split(/、|,|，|\r?\n/)
    .map((name) => name.trim())
    .filter(Boolean);
}

function normalizeStatus(status?: string) {
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

function parseLegacyEntries(value: string, documentUrl = "") {
  try {
    const parsed = JSON.parse(value.slice(reportEntryMarker.length));
    if (Array.isArray(parsed)) {
      return parsed
        .map((entry) => ({
          content: typeof entry.content === "string" ? entry.content : "",
          link: typeof entry.link === "string" ? entry.link : "",
        }))
        .filter((entry) => entry.content.trim() || entry.link.trim());
    }
  } catch {
    return value.trim() || documentUrl.trim() ? [{ content: value, link: documentUrl }] : [];
  }
  return [];
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
                    status: normalizeStatus(typeof typedReport.status === "string" ? typedReport.status : ""),
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
      return { taskContent: "", taskLinks: [], reportEntries: [], reportsByOwner: {} };
    }
  }

  if (item.content.startsWith(reportEntryMarker)) {
    return { taskContent: "", taskLinks: [], reportEntries: parseLegacyEntries(item.content, item.documentUrl), reportsByOwner: {} };
  }

  return {
    taskContent: item.content === "待補內容" ? "" : item.content,
    taskLinks: item.documentUrl ? [item.documentUrl] : [],
    reportEntries: [],
    reportsByOwner: {},
  };
}

function statusFromReports(item: WorkflowItem, content: WorkflowContent) {
  const owners = splitOwners(item.owner);
  if (owners.length === 0) return normalizeStatus(item.status);
  const statuses = owners.map((owner) => normalizeStatus(content.reportsByOwner[owner]?.status));
  if (statuses.every((status) => status === "已完成")) return "已完成";
  if (statuses.some((status) => status === "進行中" || status === "已完成")) return "進行中";
  return "未處理";
}

function statusForOwnerFilter(item: WorkflowItem, content: WorkflowContent, owner: string) {
  if (owner === "全部填報人") return statusFromReports(item, content);
  return normalizeStatus(content.reportsByOwner[owner]?.status ?? item.status);
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function wordSafeFileName(value: string) {
  return value.replace(/[\\/:*?"<>|]/g, "-").replace(/\s+/g, "-");
}

export function ReportSummary() {
  const { data, loading, message } = useFlowData();
  const [projectCode, setProjectCode] = useState("全部專案");
  const [phaseFilter, setPhaseFilter] = useState("全部階段");
  const [statusFilter, setStatusFilter] = useState("全部狀態");
  const [ownerFilter, setOwnerFilter] = useState("全部填報人");
  const [keyword, setKeyword] = useState("");

  const phases = data.phases.length > 0 ? data.phases : ["提案", "啟動", "期中", "期末"];
  const projectOptions = ["全部專案", ...data.projects.map((project) => project.code)];
  const ownerOptions = useMemo(() => {
    const names = data.workflowItems.flatMap((item) => splitOwners(item.owner));
    return ["全部填報人", ...Array.from(new Set(names)).sort((a, b) => a.localeCompare(b))];
  }, [data.workflowItems]);

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

  const visibleItems = useMemo(() => {
    const query = keyword.trim().toLowerCase();
    return data.workflowItems
      .filter((item) => projectCode === "全部專案" || item.projectCode === projectCode)
      .filter((item) => phaseFilter === "全部階段" || item.phase === phaseFilter)
      .filter((item) => {
        const content = parseWorkflowContent(item);
        const owners = splitOwners(item.owner);
        const ownerMatched = ownerFilter === "全部填報人" || owners.includes(ownerFilter);
        const statusMatched = statusFilter === "全部狀態" || statusForOwnerFilter(item, content, ownerFilter) === statusFilter;
        const searchable = [
          item.projectCode,
          item.projectName,
          item.phase,
          item.title,
          item.owner,
          item.dueDate,
          content.taskContent,
          ...content.taskLinks,
          ...content.reportEntries.flatMap((entry) => [entry.content, entry.link]),
          ...Object.entries(content.reportsByOwner).flatMap(([person, report]) => [
            person,
            report.status,
            ...report.entries.flatMap((entry) => [entry.content, entry.link]),
          ]),
        ]
          .join(" ")
          .toLowerCase();
        const keywordMatched = !query || searchable.includes(query);
        return ownerMatched && statusMatched && keywordMatched;
      })
      .sort((a, b) => {
        const aPhase = phases.indexOf(a.phase);
        const bPhase = phases.indexOf(b.phase);
        if (a.projectCode !== b.projectCode) return a.projectCode.localeCompare(b.projectCode);
        if (aPhase !== bPhase) return aPhase - bPhase;
        const positionDiff = (a.position ?? 0) - (b.position ?? 0);
        if (positionDiff !== 0) return positionDiff;
        return (a.createdAt ?? "").localeCompare(b.createdAt ?? "");
      });
  }, [data.workflowItems, keyword, ownerFilter, phaseFilter, phases, projectCode, statusFilter]);

  const summary = useMemo(() => {
    const reports = visibleItems.map((item) => ({ item, content: parseWorkflowContent(item) }));
    const reportCount = reports.reduce((sum, { item }) => {
      const owners = splitOwners(item.owner);
      const visibleOwners = ownerFilter === "全部填報人" ? owners : owners.filter((owner) => owner === ownerFilter);
      return sum + Math.max(visibleOwners.length, 1);
    }, 0);
    const doneCount = reports.filter(({ item, content }) => statusForOwnerFilter(item, content, ownerFilter) === "已完成").length;
    const linkCount = reports.reduce((sum, { content }) => {
      const ownerLinks = Object.entries(content.reportsByOwner)
        .filter(([owner]) => ownerFilter === "全部填報人" || owner === ownerFilter)
        .flatMap(([, report]) => report.entries)
        .filter((entry) => entry.link.trim()).length;
      return sum + content.reportEntries.filter((entry) => entry.link.trim()).length + ownerLinks;
    }, 0);
    return { itemCount: visibleItems.length, reportCount, doneCount, linkCount };
  }, [ownerFilter, visibleItems]);

  function downloadWordReport() {
    const generatedAt = new Date().toLocaleString("zh-TW", { hour12: false });
    const rows = visibleItems.map((item) => {
      const content = parseWorkflowContent(item);
      const owners = splitOwners(item.owner);
      const visibleOwners = ownerFilter === "全部填報人" ? owners : owners.filter((owner) => owner === ownerFilter);
      return {
        item,
        content,
        itemCode: itemCodeById.get(item.id) ?? `${phases.indexOf(item.phase) + 1}-?`,
        owners: visibleOwners.length > 0 ? visibleOwners : ["未指定"],
      };
    });
    const body = rows
      .map(({ item, content, itemCode, owners }) => {
        const taskLinks = content.taskLinks.length
          ? `<ul>${content.taskLinks.map((link) => `<li><a href="${escapeHtml(link)}">${escapeHtml(link)}</a></li>`).join("")}</ul>`
          : "<p>尚未提供參考連結</p>";
        const reports = owners
          .map((owner) => {
            const report = content.reportsByOwner[owner] ?? { status: normalizeStatus(item.status), entries: content.reportEntries };
            const entries = report.entries.length > 0 ? report.entries : [{ content: "", link: "" }];
            return `
              <h4>${escapeHtml(owner)}｜${escapeHtml(normalizeStatus(report.status))}</h4>
              ${entries
                .map(
                  (entry, index) => `
                    <p><strong>內容${entries.length > 1 ? index + 1 : ""}：</strong>${escapeHtml(entry.content.trim() || "尚未填寫")}</p>
                    <p><strong>成果連結${entries.length > 1 ? index + 1 : ""}：</strong>${
                      entry.link.trim() ? `<a href="${escapeHtml(entry.link)}">${escapeHtml(entry.link)}</a>` : "尚未提供"
                    }</p>
                  `,
                )
                .join("")}
            `;
          })
          .join("");

        return `
          <section>
            <h2>${escapeHtml(itemCode)} ${escapeHtml(item.title)}</h2>
            <table>
              <tr><th>專案</th><td>${escapeHtml(item.projectName)} (${escapeHtml(item.projectCode)})</td></tr>
              <tr><th>階段</th><td>${escapeHtml(item.phase)}</td></tr>
              <tr><th>期限</th><td>${escapeHtml(item.dueDate || "未指定")}</td></tr>
              <tr><th>指派</th><td>${escapeHtml(owners.join("、"))}</td></tr>
              <tr><th>整體狀態</th><td>${escapeHtml(statusFromReports(item, content))}</td></tr>
            </table>
            <h3>要做的內容</h3>
            <p>${escapeHtml(content.taskContent.trim() || "尚未填寫")}</p>
            <h3>參考連結</h3>
            ${taskLinks}
            <h3>研發填報內容</h3>
            ${reports}
          </section>
        `;
      })
      .join("");

    const html = `
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>成果彙整報告</title>
          <style>
            body { color: #0f172a; font-family: "Microsoft JhengHei", Arial, sans-serif; line-height: 1.6; }
            h1 { font-size: 28px; margin: 0 0 8px; }
            h2 { border-top: 1px solid #cbd5e1; font-size: 22px; margin-top: 24px; padding-top: 16px; }
            h3 { color: #1f6feb; font-size: 17px; margin: 16px 0 6px; }
            h4 { color: #087443; font-size: 16px; margin: 14px 0 4px; }
            table { border-collapse: collapse; margin: 10px 0; width: 100%; }
            th, td { border: 1px solid #cbd5e1; padding: 8px; text-align: left; vertical-align: top; }
            th { background: #f1f5f9; width: 120px; }
            a { color: #1f6feb; }
          </style>
        </head>
        <body>
          <h1>成果彙整報告</h1>
          <p>產出時間：${escapeHtml(generatedAt)}</p>
          <p>篩選：專案 ${escapeHtml(projectCode)}｜階段 ${escapeHtml(phaseFilter)}｜狀態 ${escapeHtml(statusFilter)}｜填報人 ${escapeHtml(ownerFilter)}｜關鍵字 ${escapeHtml(keyword || "無")}</p>
          <p>小關 ${summary.itemCount} 項｜填報人次 ${summary.reportCount}｜完成小關 ${summary.doneCount} 項｜成果連結 ${summary.linkCount} 筆</p>
          ${body || "<p>目前沒有符合篩選的成果內容。</p>"}
        </body>
      </html>
    `;
    const blob = new Blob(["\ufeff", html], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${wordSafeFileName(`成果彙整-${projectCode}-${new Date().toISOString().slice(0, 10)}`)}.doc`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="summary-stack">
      {message ? <p className="form-message left">{message}</p> : null}
      {loading ? <p className="plain-copy">讀取成果彙整中...</p> : null}

      <section className="panel summary-filter-panel">
        <div>
          <span>彙整篩選</span>
          <h2>完整呈現研發填報與成果連結</h2>
        </div>
        <button className="primary-action" disabled={loading} onClick={downloadWordReport} type="button">
          下載 Word
        </button>
        <div className="summary-filter-grid">
          <label>
            專案
            <select value={projectCode} onChange={(event) => setProjectCode(event.target.value)}>
              {projectOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label>
            階段
            <select value={phaseFilter} onChange={(event) => setPhaseFilter(event.target.value)}>
              <option>全部階段</option>
              {phases.map((phase) => (
                <option key={phase}>{phase}</option>
              ))}
            </select>
          </label>
          <label>
            狀態
            <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option>全部狀態</option>
              <option>未處理</option>
              <option>進行中</option>
              <option>已完成</option>
            </select>
          </label>
          <label>
            填報人
            <select value={ownerFilter} onChange={(event) => setOwnerFilter(event.target.value)}>
              {ownerOptions.map((option) => (
                <option key={option}>{option}</option>
              ))}
            </select>
          </label>
          <label className="summary-search-field">
            關鍵字
            <input placeholder="搜尋專案、小關、內容或連結" value={keyword} onChange={(event) => setKeyword(event.target.value)} />
          </label>
        </div>
      </section>

      <section className="summary-metrics">
        <article>
          <span>小關</span>
          <strong>{summary.itemCount}</strong>
        </article>
        <article>
          <span>填報人次</span>
          <strong>{summary.reportCount}</strong>
        </article>
        <article>
          <span>完成小關</span>
          <strong>{summary.doneCount}</strong>
        </article>
        <article>
          <span>成果連結</span>
          <strong>{summary.linkCount}</strong>
        </article>
      </section>

      {!loading && visibleItems.length === 0 ? (
        <section className="panel empty-state">
          <h2>目前還沒有成果內容</h2>
          <p>先在專案管理建立小關，再由研發填報內容與文件連結。</p>
          <Link className="primary-action" href="/projects">前往專案管理</Link>
        </section>
      ) : null}

      <section className="summary-list">
        {visibleItems.map((item) => {
          const content = parseWorkflowContent(item);
          const owners = splitOwners(item.owner);
          const visibleOwners = ownerFilter === "全部填報人" ? owners : owners.filter((owner) => owner === ownerFilter);
          const itemCode = itemCodeById.get(item.id) ?? `${phases.indexOf(item.phase) + 1}-?`;
          const itemStatus = statusFromReports(item, content);
          return (
            <article className={`summary-card ${phaseClass(item.phase)}`} key={item.id}>
              <header>
                <div>
                  <span>{item.projectName}</span>
                  <h2>{itemCode} {item.title}</h2>
                </div>
                <div className="summary-card-badges">
                  <b>{item.phase}</b>
                  <b>期限 {item.dueDate || "未指定"}</b>
                  <strong className={itemStatus === "已完成" ? "done" : itemStatus === "進行中" ? "active" : "waiting"}>{itemStatus}</strong>
                </div>
              </header>

              <div className="summary-meta-grid">
                <span>專案代號：{item.projectCode}</span>
                <span>指派：{(visibleOwners.length > 0 ? visibleOwners : ["未指定"]).join("、")}</span>
                <span>原始狀態：{item.status}</span>
                <span>完成日：{item.completedAt || "未完成"}</span>
              </div>

              <section className="task-content-preview">
                <span>要做的內容</span>
                <p>{content.taskContent.trim() || "尚未填寫"}</p>
                {content.taskLinks.length > 0 ? (
                  <div className="task-link-list">
                    {content.taskLinks.map((link, index) => (
                      <a href={link} key={`${item.id}-task-${index}`} rel="noreferrer" target="_blank">
                        參考連結{content.taskLinks.length > 1 ? index + 1 : ""}
                      </a>
                    ))}
                  </div>
                ) : null}
              </section>

              <div className="summary-report-grid">
                {(visibleOwners.length > 0 ? visibleOwners : ["未指定"]).map((owner) => {
                  const report = content.reportsByOwner[owner] ?? { status: normalizeStatus(item.status), entries: content.reportEntries };
                  const entries = report.entries.length > 0 ? report.entries : [{ content: "", link: "" }];
                  return (
                    <section className="person-summary" key={`${item.id}-${owner}`}>
                      <header>
                        <strong>{owner}</strong>
                        <span className={normalizeStatus(report.status) === "已完成" ? "done" : normalizeStatus(report.status) === "進行中" ? "active" : "waiting"}>
                          {normalizeStatus(report.status)}
                        </span>
                      </header>
                      {entries.map((entry, index) => (
                        <div className="person-report-entry" key={`${item.id}-${owner}-${index}`}>
                          <p>{entry.content.trim() || "尚未填寫"}</p>
                          {entry.link.trim() ? (
                            <a href={entry.link} rel="noreferrer" target="_blank">
                              開啟成果連結{entries.length > 1 ? index + 1 : ""}
                            </a>
                          ) : (
                            <small>尚未提供成果連結</small>
                          )}
                        </div>
                      ))}
                    </section>
                  );
                })}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
