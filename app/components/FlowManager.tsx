"use client";

import { useEffect, useMemo, useState } from "react";

type ProjectRow = {
  code: string;
  name: string;
  agency: string;
  manager: string;
  developers: string[];
  stage: string;
  progress: number;
  risk: string;
  due: string;
  budget: string;
  nextAction: string;
};

type WorkflowItem = {
  id: string;
  projectCode: string;
  projectName: string;
  phase: string;
  title: string;
  owner: string;
  role: string;
  content: string;
  dueDate: string;
  status: string;
  documentUrl: string;
  completedAt: string;
};

type FlowPayload = {
  phases: string[];
  projects: ProjectRow[];
  workflowItems: WorkflowItem[];
  error?: string;
};

const defaultPhases = ["提案", "啟動", "期中", "期末"];

const emptyProject = {
  projectCode: "",
  projectName: "",
  agency: "",
  manager: "",
  developers: "",
  budget: "",
  due: "",
  risk: "中",
};

const emptyItem = {
  projectCode: "",
  phase: "提案",
  title: "",
  owner: "",
  role: "專案管理人員",
  content: "",
  dueDate: "",
  documentUrl: "",
};

export function FlowManager() {
  const [phases, setPhases] = useState(defaultPhases);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [items, setItems] = useState<WorkflowItem[]>([]);
  const [projectForm, setProjectForm] = useState(emptyProject);
  const [itemForm, setItemForm] = useState(emptyItem);
  const [message, setMessage] = useState("正在讀取流程資料...");

  useEffect(() => {
    reload();
  }, []);

  async function reload() {
    try {
      const response = await fetch("/api/flow");
      const payload = (await response.json()) as FlowPayload;
      if (payload.error) {
        setMessage(payload.error);
        return;
      }
      setPhases(payload.phases);
      setProjects(payload.projects);
      setItems(payload.workflowItems);
      setMessage("已連上 Cloudflare D1，流程資料會保存。");
    } catch {
      setMessage("資料讀取失敗，請重新整理。");
    }
  }

  const selectedProject = useMemo(
    () => projects.find((project) => project.code === itemForm.projectCode),
    [itemForm.projectCode, projects],
  );

  const progressByProject = useMemo(() => {
    return projects.map((project) => {
      const projectItems = items.filter((item) => item.projectCode === project.code);
      const done = projectItems.filter((item) => item.status === "已完成").length;
      const progress = projectItems.length ? Math.round((done / projectItems.length) * 100) : 0;
      return { ...project, itemCount: projectItems.length, doneCount: done, flowProgress: progress };
    });
  }, [items, projects]);

  function updateProjectField(field: keyof typeof emptyProject, value: string) {
    setProjectForm((current) => ({ ...current, [field]: value }));
  }

  function updateItemField(field: keyof typeof emptyItem, value: string) {
    setItemForm((current) => ({ ...current, [field]: value }));
  }

  async function createProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("正在建立專案...");
    const response = await fetch("/api/flow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "create-project", ...projectForm }),
    });
    const payload = await response.json() as { project?: ProjectRow; error?: string };
    if (!response.ok || payload.error || !payload.project) {
      setMessage(payload.error ?? "建立專案失敗。");
      return;
    }
    setProjects((current) => [payload.project!, ...current]);
    setProjectForm(emptyProject);
    setItemForm((current) => ({ ...current, projectCode: payload.project!.code }));
    setMessage("專案已建立，請新增第一個小關。");
  }

  async function createItem(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedProject) {
      setMessage("請先選擇專案。");
      return;
    }
    setMessage("正在新增小關...");
    const response = await fetch("/api/flow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "create-item",
        ...itemForm,
        projectName: selectedProject.name,
      }),
    });
    const payload = await response.json() as { item?: WorkflowItem; error?: string };
    if (!response.ok || payload.error || !payload.item) {
      setMessage(payload.error ?? "新增小關失敗。");
      return;
    }
    setItems((current) => [payload.item!, ...current]);
    setItemForm((current) => ({ ...emptyItem, projectCode: current.projectCode, phase: current.phase }));
    setMessage("小關已建立，負責窗口可以開始執行。");
  }

  async function updateItem(id: string, patch: Partial<WorkflowItem>) {
    const previous = items;
    setItems((current) => current.map((item) => item.id === id ? { ...item, ...patch } : item));
    const response = await fetch("/api/flow", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    const payload = await response.json() as { item?: WorkflowItem; error?: string };
    if (!response.ok || payload.error || !payload.item) {
      setItems(previous);
      setMessage(payload.error ?? "更新失敗。");
      return;
    }
    setItems((current) => current.map((item) => item.id === id ? payload.item! : item));
    setMessage("流程狀態已更新。");
  }

  return (
    <>
      <section className="flow-summary-grid">
        {progressByProject.length === 0 ? (
          <article className="flow-empty-card">
            <span>尚未建立真實專案</span>
            <h2>請先在下方建立第一個專案</h2>
            <p>建立後就可以在提案、啟動、期中、期末四階段底下自由新增小關。</p>
          </article>
        ) : null}
        {progressByProject.map((project) => (
          <article className="flow-project-card" key={project.code}>
            <span>{project.code}</span>
            <h2>{project.name}</h2>
            <p>PM：{project.manager} · 研發：{project.developers.join("、") || "未指定"}</p>
            <div className="progress-cell wide">
              <div className="progress-track">
                <span style={{ width: `${project.flowProgress}%` }} />
              </div>
              <b>{project.flowProgress}%</b>
            </div>
            <footer>
              <b>{project.doneCount}/{project.itemCount} 小關完成</b>
              <strong>{project.stage}</strong>
            </footer>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <div className="section-title">
            <div>
              <p>新增專案</p>
              <h2>建立四階段流程的主案件</h2>
            </div>
          </div>
          <form className="meeting-form compact-form" onSubmit={createProject}>
            <label>專案代號<input value={projectForm.projectCode} onChange={(event) => updateProjectField("projectCode", event.target.value)} placeholder="例如 GA-2026-020" /></label>
            <label>專案名稱<input value={projectForm.projectName} onChange={(event) => updateProjectField("projectName", event.target.value)} required /></label>
            <label>補助/機關<input value={projectForm.agency} onChange={(event) => updateProjectField("agency", event.target.value)} /></label>
            <label>計畫人員<input value={projectForm.manager} onChange={(event) => updateProjectField("manager", event.target.value)} /></label>
            <label>研發窗口<input value={projectForm.developers} onChange={(event) => updateProjectField("developers", event.target.value)} placeholder="可用、分隔多人" /></label>
            <label>預算<input value={projectForm.budget} onChange={(event) => updateProjectField("budget", event.target.value)} /></label>
            <label>總期限<input value={projectForm.due} onChange={(event) => updateProjectField("due", event.target.value)} /></label>
            <label>風險<select value={projectForm.risk} onChange={(event) => updateProjectField("risk", event.target.value)}><option>低</option><option>中</option><option>高</option></select></label>
            <button className="primary-action" type="submit">建立專案</button>
          </form>
        </article>

        <article className="panel">
          <div className="section-title">
            <div>
              <p>新增小關</p>
              <h2>在四階段下自由新增流程節點</h2>
            </div>
            <strong className="form-message">{message}</strong>
          </div>
          <form className="meeting-form compact-form" onSubmit={createItem}>
            <label>專案<select value={itemForm.projectCode} onChange={(event) => updateItemField("projectCode", event.target.value)} required><option value="">選擇專案</option>{projects.map((project) => <option key={project.code} value={project.code}>{project.name}</option>)}</select></label>
            <label>階段<select value={itemForm.phase} onChange={(event) => updateItemField("phase", event.target.value)}>{phases.map((phase) => <option key={phase}>{phase}</option>)}</select></label>
            <label>小關名稱<input value={itemForm.title} onChange={(event) => updateItemField("title", event.target.value)} required /></label>
            <label>負責窗口<input value={itemForm.owner} onChange={(event) => updateItemField("owner", event.target.value)} placeholder="計畫或研發窗口" /></label>
            <label>角色<select value={itemForm.role} onChange={(event) => updateItemField("role", event.target.value)}><option>專案管理人員</option><option>開發人員</option><option>管理層</option></select></label>
            <label>結束時間<input value={itemForm.dueDate} onChange={(event) => updateItemField("dueDate", event.target.value)} placeholder="08/15" /></label>
            <label className="wide-field">對應內容<textarea value={itemForm.content} onChange={(event) => updateItemField("content", event.target.value)} placeholder="說明這個小關要完成什麼、方向是什麼" /></label>
            <label className="wide-field">文件或 Google 連結<input value={itemForm.documentUrl} onChange={(event) => updateItemField("documentUrl", event.target.value)} placeholder="https://docs.google.com/..." /></label>
            <button className="primary-action" type="submit">新增小關</button>
          </form>
        </article>
      </section>

      <section className="flow-board">
        {phases.map((phase) => (
          <article className="flow-phase" key={phase}>
            <header>
              <span>{phase}</span>
              <strong>{items.filter((item) => item.phase === phase).length} 項小關</strong>
            </header>
            {items.filter((item) => item.phase === phase).map((item) => (
              <section className="flow-item" key={item.id}>
                <div className="flow-item-head">
                  <span>{item.projectName}</span>
                  <b>{item.status}</b>
                </div>
                <h3>{item.title}</h3>
                <p>{item.content}</p>
                <dl>
                  <div><dt>窗口</dt><dd>{item.owner} · {item.role}</dd></div>
                  <div><dt>結束時間</dt><dd>{item.dueDate}</dd></div>
                  <div><dt>完成時間</dt><dd>{item.completedAt || "尚未完成"}</dd></div>
                </dl>
                <label>
                  文件 / Google 連結
                  <input
                    value={item.documentUrl}
                    onChange={(event) => updateItem(item.id, { documentUrl: event.target.value })}
                    placeholder="貼上文件連結"
                  />
                </label>
                <div className="flow-actions">
                  <button className="secondary-action" onClick={() => updateItem(item.id, { status: "進行中" })}>進行中</button>
                  <button className="primary-action" onClick={() => updateItem(item.id, { status: "已完成" })}>研發完成</button>
                </div>
                {item.documentUrl ? <a className="doc-link" href={item.documentUrl} target="_blank" rel="noreferrer">開啟文件</a> : null}
              </section>
            ))}
          </article>
        ))}
      </section>
    </>
  );
}
