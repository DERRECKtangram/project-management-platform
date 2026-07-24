import { AppShell } from "../components/AppShell";
import { actionItems, members } from "../data";

export default function PeoplePage() {
  const managerTasks = actionItems.filter((item) => item.role === "專案管理人員");
  const developerTasks = actionItems.filter((item) => item.role === "開發人員");

  return (
    <AppShell
      active="/people"
      eyebrow="人員與任務"
      title="不同角色進入後看到自己的責任"
      actions={<button className="primary-action">分派任務</button>}
    >
      <section className="role-entry-grid">
        <article className="entry-card manager-entry">
          <span>專案管理人員入口</span>
          <h2>追流程、補資料、確認下一步</h2>
          <p>負責把會議決議、附件缺口、期限與跨部門協作整理成可追蹤任務。</p>
          <strong>{managerTasks.length} 項會後任務</strong>
        </article>
        <article className="entry-card developer-entry">
          <span>開發人員入口</span>
          <h2>看自己要交付的技術成果</h2>
          <p>負責測試數據、技術成果、截圖、設備需求、KPI 佐證與委員問題回覆。</p>
          <strong>{developerTasks.length} 項技術任務</strong>
        </article>
      </section>

      <section className="people-grid">
        {members.map((member) => (
          <article className="person-card" key={member.name}>
            <div className="person-avatar">{member.name.slice(0, 1)}</div>
            <div>
              <span>{member.role}</span>
              <h2>{member.name}</h2>
              <p>{member.team}</p>
            </div>
            <p>{member.focus}</p>
            <footer>
              <b>{member.assigned} 項任務</b>
              <strong>{member.overdue} 項逾期</strong>
            </footer>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <div className="section-title compact">
            <div>
              <p>專案管理人員</p>
              <h2>需要追蹤的會後事項</h2>
            </div>
          </div>
          {managerTasks.map((item) => (
            <div className="task-row" key={item.id}>
              <span>{item.id}</span>
              <div>
                <b>{item.title}</b>
                <small>{item.project} · 來源：{item.sourceMeeting}</small>
              </div>
              <strong>{item.assignee}</strong>
              <em>{item.due}</em>
            </div>
          ))}
        </article>

        <article className="panel">
          <div className="section-title compact">
            <div>
              <p>開發人員</p>
              <h2>需要交付的技術任務</h2>
            </div>
          </div>
          {developerTasks.map((item) => (
            <div className="task-row" key={item.id}>
              <span>{item.id}</span>
              <div>
                <b>{item.title}</b>
                <small>{item.project} · {item.gate}</small>
              </div>
              <strong>{item.assignee}</strong>
              <em>{item.status}</em>
            </div>
          ))}
        </article>
      </section>
    </AppShell>
  );
}
