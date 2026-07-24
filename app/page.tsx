"use client";

import { useMemo, useState } from "react";

type GateStatus = "done" | "active" | "risk" | "waiting";

type Checkpoint = {
  id: string;
  title: string;
  task: string;
  condition: string;
  benefit: string;
  next: string;
  status: GateStatus;
  owner: string;
};

type Gate = {
  id: string;
  name: string;
  subtitle: string;
  color: "amber" | "blue" | "violet" | "green";
  summary: string;
  checkpoints: Checkpoint[];
};

const gates: Gate[] = [
  {
    id: "proposal",
    name: "第一大關",
    subtitle: "提案與方向確認",
    color: "amber",
    summary: "成果、工期與資源確認後才能正式送件。",
    checkpoints: [
      {
        id: "scope",
        title: "確認成果範圍",
        task: "整理申請需求、公司目標、技術成果與查核排除範圍。",
        condition: "目標、成果、範圍已由政府要求反推確認。",
        benefit: "降低臨時加功能與反覆修改。",
        next: "確認工期與資源",
        status: "done",
        owner: "專案部門",
      },
      {
        id: "resource",
        title: "確認工期與資源",
        task: "拆解技術工作、估算時程、盤點人力與外部依賴。",
        condition: "工期與資源經執行人員確認，重大可行性問題已處理。",
        benefit: "避免開始後才發現來不及或缺設備。",
        next: "只允許可執行案件往下推進",
        status: "active",
        owner: "RD / FAE",
      },
      {
        id: "delivery",
        title: "完成計畫書與送件",
        task: "完成計畫書、查核點、附件與重大承諾後送件。",
        condition: "技術、工期、資源、附件確認，審查結果已保存。",
        benefit: "減少補件與版本混亂。",
        next: "送出正式版本",
        status: "waiting",
        owner: "管理層",
      },
    ],
  },
  {
    id: "launch",
    name: "第二大關",
    subtitle: "核定與正式啟動",
    color: "blue",
    summary: "把核定內容轉成每個人看得懂、做得到的任務。",
    checkpoints: [
      {
        id: "gap",
        title: "確認核案差異",
        task: "比對送件版與核定版，標示預算、時程、功能、KPI 與成果變更。",
        condition: "差異、技術影響、查核點與重大決策均已確認。",
        benefit: "避免用舊版本執行。",
        next: "建立任務與責任",
        status: "done",
        owner: "專案部門",
      },
      {
        id: "responsibility",
        title: "建立任務與責任",
        task: "拆解必要工作，設定唯一負責人、期限、成果與任務順序。",
        condition: "每項工作皆有人、有期限、有明確成果。",
        benefit: "避免事情卡住時無人負責。",
        next: "查看任務地圖",
        status: "active",
        owner: "專案經理",
      },
      {
        id: "blocker",
        title: "排除啟動障礙",
        task: "確認資料、設備、場域、人力、預算、採購與合作條件。",
        condition: "啟動條件到位，缺口有等待對象與追蹤人。",
        benefit: "避免宣布啟動後仍在等資源。",
        next: "開始執行",
        status: "risk",
        owner: "管理層",
      },
    ],
  },
  {
    id: "midterm",
    name: "第三大關",
    subtitle: "期中成果與審查",
    color: "violet",
    summary: "執行同步累積成果，避免到期前才追資料。",
    checkpoints: [
      {
        id: "evidence",
        title: "執行工作並留下成果",
        task: "更新進度、上傳數據、測試截圖、照片與相關文件。",
        condition: "已完成工作皆有成果證明，卡點有等待對象。",
        benefit: "期中前不用重新找資料或重寫內容。",
        next: "確認缺口與風險",
        status: "active",
        owner: "RD / FAE",
      },
      {
        id: "risk",
        title: "確認缺口與風險",
        task: "標示系統整理已完成、尚缺、待提供、3 天 / 7 天到期與逾期項。",
        condition: "每個缺口有負責人、風險處理方式與完成時間。",
        benefit: "提前發現缺少照片、數據或測試資料。",
        next: "處理期中缺口",
        status: "risk",
        owner: "專案經理",
      },
      {
        id: "mid-report",
        title: "完成並提交期中報告",
        task: "彙整成果附件、進度與未完成事項，保存委員意見。",
        condition: "正確版本已提交，缺口原因、進度、日期與改善安排齊全。",
        benefit: "直接用平時成果完成報告。",
        next: "提交期中報告",
        status: "waiting",
        owner: "專案部門",
      },
    ],
  },
  {
    id: "close",
    name: "第四大關",
    subtitle: "期末成果與結案",
    color: "green",
    summary: "完成剩餘成果、收齊佐證、提交結案報告並封存。",
    checkpoints: [
      {
        id: "final-work",
        title: "完成剩餘成果與改善事項",
        task: "完成技術工作、最終測試、數據與委員意見回覆。",
        condition: "必要成果完成或有合理說明，改善事項已安排結果。",
        benefit: "避免期末審查前大量補件。",
        next: "更新最終成果",
        status: "waiting",
        owner: "RD / FAE",
      },
      {
        id: "archive",
        title: "收齊結案資料",
        task: "收齊技術成果、測試報告、數據、截圖、照片、KPI、經費與附件。",
        condition: "必要資料齊全或有正式說明，來源與版本清楚。",
        benefit: "避免最後找不到佐證。",
        next: "補齊結案資料",
        status: "waiting",
        owner: "專案部門",
      },
      {
        id: "final-report",
        title: "完成結案報告與封存",
        task: "彙整歷程、成果、KPI、差異、委員回覆，提交並封存。",
        condition: "報告提交、審查保存、資料封存且不可再隨意修改。",
        benefit: "保留工作證明，方便查核與延伸申請。",
        next: "完成結案並封存",
        status: "waiting",
        owner: "管理層",
      },
    ],
  },
];

const projects = [
  {
    name: "智慧空壓節能監測計畫",
    code: "GA-2026-014",
    agency: "經濟部示範補助",
    progress: 47,
    gate: "launch",
    risk: "高",
    due: "8 天後",
  },
  {
    name: "AI 品檢資料整合平台",
    code: "GA-2026-019",
    agency: "產業升級專案",
    progress: 72,
    gate: "midterm",
    risk: "中",
    due: "17 天後",
  },
  {
    name: "低碳製程導入輔導案",
    code: "GA-2026-006",
    agency: "地方型 SBIR",
    progress: 28,
    gate: "proposal",
    risk: "低",
    due: "4 天後",
  },
];

const statusLabel: Record<GateStatus, string> = {
  done: "已完成",
  active: "進行中",
  risk: "有風險",
  waiting: "待啟動",
};

export default function Home() {
  const [selectedGate, setSelectedGate] = useState(gates[1].id);
  const currentGate = gates.find((gate) => gate.id === selectedGate) ?? gates[0];

  const totals = useMemo(() => {
    const checkpoints = gates.flatMap((gate) => gate.checkpoints);
    return {
      done: checkpoints.filter((item) => item.status === "done").length,
      risk: checkpoints.filter((item) => item.status === "risk").length,
      waiting: checkpoints.filter((item) => item.status === "waiting").length,
      all: checkpoints.length,
    };
  }, []);

  return (
    <main className="workspace">
      <aside className="sidebar" aria-label="專案清單">
        <div className="brand">
          <span className="brand-mark">PM</span>
          <div>
            <p>政府計畫案</p>
            <h1>關卡管理平台</h1>
          </div>
        </div>

        <div className="search-box">
          <span>搜尋</span>
          <input aria-label="搜尋專案" placeholder="案件、代號、機關" />
        </div>

        <section className="project-list" aria-label="案件">
          {projects.map((project) => (
            <button
              className={`project-card ${project.gate === selectedGate ? "selected" : ""}`}
              key={project.code}
              onClick={() => setSelectedGate(project.gate)}
            >
              <span className="project-code">{project.code}</span>
              <strong>{project.name}</strong>
              <span>{project.agency}</span>
              <div className="progress-row">
                <div className="progress-track">
                  <span style={{ width: `${project.progress}%` }} />
                </div>
                <b>{project.progress}%</b>
              </div>
              <div className="project-meta">
                <span>風險 {project.risk}</span>
                <span>{project.due}</span>
              </div>
            </button>
          ))}
        </section>
      </aside>

      <section className="content">
        <header className="topbar">
          <div>
            <p className="eyebrow">完整內容架構</p>
            <h2>四大關 × 每關 3 個核心小關</h2>
          </div>
          <div className="top-actions" aria-label="平台動作">
            <button>新增案件</button>
            <button>匯出報告</button>
          </div>
        </header>

        <section className="metric-grid" aria-label="總覽">
          <article>
            <span>完成檢核</span>
            <strong>{totals.done}</strong>
            <small>項已可作為送審依據</small>
          </article>
          <article>
            <span>風險缺口</span>
            <strong>{totals.risk}</strong>
            <small>項需要責任人處理</small>
          </article>
          <article>
            <span>待啟動</span>
            <strong>{totals.waiting}</strong>
            <small>項等前置條件完成</small>
          </article>
          <article>
            <span>完整規則</span>
            <strong>{totals.all}</strong>
            <small>項關卡檢核</small>
          </article>
        </section>

        <nav className="gate-tabs" aria-label="四大關切換">
          {gates.map((gate) => (
            <button
              className={`${gate.color} ${gate.id === selectedGate ? "active" : ""}`}
              key={gate.id}
              onClick={() => setSelectedGate(gate.id)}
            >
              <span>{gate.name}</span>
              <strong>{gate.subtitle}</strong>
            </button>
          ))}
        </nav>

        <section className={`gate-panel ${currentGate.color}`}>
          <div className="gate-heading">
            <div>
              <p>{currentGate.name}</p>
              <h3>{currentGate.subtitle}</h3>
            </div>
            <span>{currentGate.summary}</span>
          </div>

          <div className="checkpoint-grid">
            {currentGate.checkpoints.map((checkpoint, index) => (
              <article className="checkpoint" key={checkpoint.id}>
                <div className="checkpoint-title">
                  <span>{index + 1}</span>
                  <div>
                    <h4>{checkpoint.title}</h4>
                    <p>{statusLabel[checkpoint.status]}</p>
                  </div>
                </div>
                <dl>
                  <div>
                    <dt>主要任務</dt>
                    <dd>{checkpoint.task}</dd>
                  </div>
                  <div>
                    <dt>完成條件</dt>
                    <dd>{checkpoint.condition}</dd>
                  </div>
                  <div>
                    <dt>好處</dt>
                    <dd>{checkpoint.benefit}</dd>
                  </div>
                  <div>
                    <dt>下一步</dt>
                    <dd>{checkpoint.next}</dd>
                  </div>
                </dl>
                <footer>
                  <span>負責：{checkpoint.owner}</span>
                  <b className={checkpoint.status}>{statusLabel[checkpoint.status]}</b>
                </footer>
              </article>
            ))}
          </div>
        </section>
      </section>

      <aside className="inspector" aria-label="案件狀態摘要">
        <section className="panel">
          <h3>今日焦點</h3>
          <div className="focus-item danger">
            <span>缺口</span>
            <strong>啟動障礙尚未排除</strong>
            <p>採購設備與測試場域未完成確認，需管理層今天決策。</p>
          </div>
          <div className="focus-item warning">
            <span>期限</span>
            <strong>送件倒數 4 天</strong>
            <p>提案案件附件仍缺預算明細與技術成果截圖。</p>
          </div>
        </section>

        <section className="panel">
          <h3>附件收齊狀態</h3>
          {["計畫書版本", "技術成果", "測試數據", "照片截圖", "委員意見"].map(
            (item, index) => (
              <div className="attachment" key={item}>
                <span>{item}</span>
                <b>{index < 2 ? "已收齊" : index === 2 ? "需補件" : "待上傳"}</b>
              </div>
            ),
          )}
        </section>

        <section className="panel">
          <h3>權責分工</h3>
          <div className="role-row">
            <b>專案部門</b>
            <span>統整推進、會議、附件與資料確認</span>
          </div>
          <div className="role-row">
            <b>RD / FAE</b>
            <span>提供技術內容、成果與測試佐證</span>
          </div>
          <div className="role-row">
            <b>管理層</b>
            <span>方向、資源與重大決策</span>
          </div>
        </section>
      </aside>
    </main>
  );
}
