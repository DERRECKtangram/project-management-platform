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

export function ReportSummary() {
  const { data, loading, message } = useFlowData();
  const [projectCode, setProjectCode] = useState("全部專案");

  const phases = data.phases.length > 0 ? data.phases : ["提案", "啟動", "期中", "期末"];
  const projectOptions = ["全部專案", ...data.projects.map((project) => project.code)];

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
    return data.workflowItems
      .filter((item) => projectCode === "全部專案" || item.projectCode === projectCode)
      .sort((a, b) => {
        const aPhase = phases.indexOf(a.phase);
        const bPhase = phases.indexOf(b.phase);
        if (a.projectCode !== b.projectCode) return a.projectCode.localeCompare(b.projectCode);
        if (aPhase !== bPhase) return aPhase - bPhase;
        const positionDiff = (a.position ?? 0) - (b.position ?? 0);
        if (positionDiff !== 0) return positionDiff;
        return (a.createdAt ?? "").localeCompare(b.createdAt ?? "");
      });
  }, [data.workflowItems, phases, projectCode]);

  const summary = useMemo(() => {
    const reports = visibleItems.map((item) => ({ item, content: parseWorkflowContent(item) }));
    const reportCount = reports.reduce((sum, { item }) => sum + Math.max(splitOwners(item.owner).length, 1), 0);
    const doneCount = reports.filter(({ item, content }) => statusFromReports(item, content) === "已完成").length;
    const linkCount = reports.reduce((sum, { content }) => {
      const ownerLinks = Object.values(content.reportsByOwner).flatMap((report) => report.entries).filter((entry) => entry.link.trim()).length;
      return sum + content.reportEntries.filter((entry) => entry.link.trim()).length + ownerLinks;
    }, 0);
    return { itemCount: visibleItems.length, reportCount, doneCount, linkCount };
  }, [visibleItems]);

  return (
    <div className="summary-stack">
      {message ? <p className="form-message left">{message}</p> : null}
      {loading ? <p className="plain-copy">讀取成果彙整中...</p> : null}

      <section className="panel summary-filter-panel">
        <div>
          <span>彙整篩選</span>
          <h2>把研發填報內容集中看</h2>
        </div>
        <label>
          專案
          <select value={projectCode} onChange={(event) => setProjectCode(event.target.value)}>
            {projectOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </label>
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
                  <strong className={itemStatus === "已完成" ? "done" : itemStatus === "進行中" ? "active" : "waiting"}>{itemStatus}</strong>
                </div>
              </header>

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
                {(owners.length > 0 ? owners : ["未指定"]).map((owner) => {
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
