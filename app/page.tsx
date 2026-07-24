import { AppShell } from "./components/AppShell";
import { documents, gateSteps, meetings, projects, statusText } from "./data";

export default function DashboardPage() {
  const riskCount = gateSteps.filter((step) => step.status === "risk").length;
  const doneCount = gateSteps.filter((step) => step.status === "done").length;

  return (
    <AppShell
      active="/"
      eyebrow="營運總覽"
      title="政府計畫案執行儀表板"
      actions={
        <>
          <button className="primary-action">新增案件</button>
          <button className="secondary-action">產生週報</button>
        </>
      }
    >
      <section className="metric-grid">
        <article>
          <span>進行中案件</span>
          <strong>{projects.length}</strong>
          <small>跨提案、啟動、期中與結案</small>
        </article>
        <article>
          <span>已完成檢核</span>
          <strong>{doneCount}</strong>
          <small>可直接作為送審依據</small>
        </article>
        <article>
          <span>風險缺口</span>
          <strong>{riskCount}</strong>
          <small>需要今天指定處理人</small>
        </article>
        <article>
          <span>待補附件</span>
          <strong>{documents.filter((item) => item.status !== "已收齊").length}</strong>
          <small>含待上傳與待確認</small>
        </article>
      </section>

      <section className="dashboard-grid">
        <article className="panel large-panel">
          <div className="section-title">
            <div>
              <p>案件進度</p>
              <h2>目前所有專案</h2>
            </div>
            <a href="/projects">查看全部</a>
          </div>
          <div className="project-table">
            {projects.map((project) => (
              <div className="table-row" key={project.code}>
                <div>
                  <b>{project.name}</b>
                  <span>{project.code} · {project.agency}</span>
                </div>
                <span className={`risk-pill risk-${project.risk}`}>風險 {project.risk}</span>
                <div className="progress-cell">
                  <div className="progress-track">
                    <span style={{ width: `${project.progress}%` }} />
                  </div>
                  <b>{project.progress}%</b>
                </div>
                <strong>{project.due}</strong>
              </div>
            ))}
          </div>
        </article>

        <aside className="panel">
          <div className="section-title compact">
            <div>
              <p>今日焦點</p>
              <h2>需要推進</h2>
            </div>
          </div>
          {projects.slice(0, 3).map((project) => (
            <div className="focus-card" key={project.code}>
              <span>{project.stage}</span>
              <strong>{project.nextAction}</strong>
              <p>{project.owner} · {project.due}</p>
            </div>
          ))}
        </aside>
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <div className="section-title compact">
            <div>
              <p>關卡檢核</p>
              <h2>未完成項目</h2>
            </div>
          </div>
          {gateSteps.filter((step) => step.status !== "done").slice(0, 5).map((step) => (
            <div className="list-item" key={`${step.gate}-${step.title}`}>
              <span className={step.color}>{step.gate}</span>
              <b>{step.title}</b>
              <small>{statusText[step.status]} · {step.owner}</small>
            </div>
          ))}
        </article>

        <article className="panel">
          <div className="section-title compact">
            <div>
              <p>近期會議</p>
              <h2>決策與追蹤</h2>
            </div>
          </div>
          {meetings.map((meeting) => (
            <div className="list-item" key={meeting.title}>
              <span>{meeting.date}</span>
              <b>{meeting.title}</b>
              <small>{meeting.project}</small>
            </div>
          ))}
        </article>
      </section>
    </AppShell>
  );
}
