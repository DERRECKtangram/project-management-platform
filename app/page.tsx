import { AppShell } from "./components/AppShell";
import { actionItems, documents, gateSteps, meetingRecords, projects, statusText } from "./data";

export default function DashboardPage() {
  const riskCount = gateSteps.filter((step) => step.status === "risk").length;
  const doneCount = gateSteps.filter((step) => step.status === "done").length;
  const developerItems = actionItems.filter((item) => item.role === "開發人員");
  const managerItems = actionItems.filter((item) => item.role === "專案管理人員");

  return (
    <AppShell
      active="/"
      eyebrow="營運總覽"
      title="每次開會後，都能知道下一步怎麼走"
      actions={
        <>
          <button className="primary-action">新增會議紀錄</button>
          <button className="secondary-action">產生週報</button>
        </>
      }
    >
      <section className="role-entry-grid">
        <article className="entry-card manager-entry">
          <span>專案管理人員</span>
          <h2>追蹤流程與會後決議</h2>
          <p>看所有案件卡在哪一關、誰該補資料、下次會議前要完成什麼。</p>
          <strong>{managerItems.length} 項管理任務</strong>
        </article>
        <article className="entry-card developer-entry">
          <span>開發人員</span>
          <h2>只看自己被分配的交付</h2>
          <p>看技術成果、測試數據、截圖佐證、委員回覆與期限。</p>
          <strong>{developerItems.length} 項開發任務</strong>
        </article>
      </section>

      <section className="metric-grid">
        <article>
          <span>進行中案件</span>
          <strong>{projects.length}</strong>
          <small>跨提案、啟動、期中與結案</small>
        </article>
        <article>
          <span>會後任務</span>
          <strong>{actionItems.length}</strong>
          <small>由會議決議轉成待辦</small>
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
                  <span>{project.code} · PM：{project.manager} · 開發：{project.developers.join("、")}</span>
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
              <p>會議後續</p>
              <h2>下一步待辦</h2>
            </div>
          </div>
          {actionItems.slice(0, 4).map((item) => (
            <div className="focus-card" key={item.id}>
              <span>{item.sourceMeeting} · {item.gate}</span>
              <strong>{item.title}</strong>
              <p>{item.assignee} · {item.due} · {item.status}</p>
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
              <small>{statusText[step.status]} · 負責：{step.assignee}</small>
            </div>
          ))}
        </article>

        <article className="panel">
          <div className="section-title compact">
            <div>
              <p>最近會議</p>
              <h2>決議與追蹤</h2>
            </div>
          </div>
          {meetingRecords.map((meeting) => (
            <div className="list-item" key={meeting.id}>
              <span>{meeting.date}</span>
              <b>{meeting.title}</b>
              <small>{meeting.project} · 下次追蹤：{meeting.nextReview}</small>
            </div>
          ))}
        </article>
      </section>
    </AppShell>
  );
}
