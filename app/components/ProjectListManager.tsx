"use client";

import Link from "next/link";
import { useMemo, useState, type FormEvent } from "react";
import { useFlowData } from "./useFlowData";

const riskOptions = ["低", "中", "高"];

export function ProjectListManager() {
  const { data, loading, message, setMessage, refresh } = useFlowData();
  const [query, setQuery] = useState("");
  const [stage, setStage] = useState("全部");
  const [saving, setSaving] = useState(false);

  const filteredProjects = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    return data.projects.filter((project) => {
      const matchesStage = stage === "全部" || project.stage === stage;
      const haystack = [
        project.code,
        project.name,
        project.agency,
        project.manager,
        project.developers.join("、"),
      ]
        .join(" ")
        .toLowerCase();
      return matchesStage && (!keyword || haystack.includes(keyword));
    });
  }, [data.projects, query, stage]);

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
          projectCode: form.get("projectCode"),
          projectName: form.get("projectName"),
          agency: form.get("agency"),
          manager: form.get("manager"),
          developers: form.get("developers"),
          due: form.get("due"),
          budget: form.get("budget"),
          risk: form.get("risk"),
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
            專案代號
            <input name="projectCode" placeholder="例如 GA-2026-020" />
          </label>
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
          <label>
            風險
            <select name="risk" defaultValue="中">
              {riskOptions.map((risk) => (
                <option key={risk} value={risk}>
                  {risk}
                </option>
              ))}
            </select>
          </label>
          <button className="primary-action" disabled={saving} type="submit">
            {saving ? "建立中" : "建立專案"}
          </button>
        </form>
        {message ? <p className="form-message left">{message}</p> : null}
      </section>

      <section className="panel">
        <div className="section-title">
          <div>
            <p>專案清單</p>
            <h2>點進專案後管理提案、啟動、期中、期末</h2>
          </div>
        </div>
        <div className="toolbar">
          <input
            aria-label="搜尋專案"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="搜尋專案、代號、PM、研發"
            value={query}
          />
          <select aria-label="篩選階段" onChange={(event) => setStage(event.target.value)} value={stage}>
            <option>全部</option>
            {data.phases.map((phase) => (
              <option key={phase}>{phase}</option>
            ))}
          </select>
        </div>

        {loading ? <p className="plain-copy">讀取專案中...</p> : null}
        {!loading && filteredProjects.length === 0 ? (
          <div className="empty-state">
            <h2>目前沒有正式專案</h2>
            <p>請先建立一個主案件，之後每個專案可以自由新增四階段底下的小關。</p>
          </div>
        ) : null}

        <div className="project-board">
          {filteredProjects.map((project) => {
            const items = data.workflowItems.filter((item) => item.projectCode === project.code);
            const done = items.filter((item) => item.status === "已完成").length;
            return (
              <Link className="project-detail-card clickable-card" href={`/projects/${encodeURIComponent(project.code)}`} key={project.code}>
                <div className="card-head">
                  <span>{project.code}</span>
                  <b className={`risk-pill risk-${project.risk}`}>風險 {project.risk}</b>
                </div>
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
                <footer>
                  <span>下一步</span>
                  <strong>{project.nextAction}</strong>
                  <small>{done}/{items.length} 小關完成</small>
                </footer>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
