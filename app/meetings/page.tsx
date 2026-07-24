import { AppShell } from "../components/AppShell";
import { meetings } from "../data";

export default function MeetingsPage() {
  return (
    <AppShell
      active="/meetings"
      eyebrow="會議追蹤"
      title="決策、附件確認與委員問題管理"
      actions={<button className="primary-action">新增會議</button>}
    >
      <section className="meeting-list">
        {meetings.map((meeting) => (
          <article className="meeting-card" key={meeting.title}>
            <time>{meeting.date}</time>
            <div>
              <h2>{meeting.title}</h2>
              <p>{meeting.project}</p>
            </div>
            <span>{meeting.owner}</span>
            <strong>{meeting.outcome}</strong>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <div className="section-title compact">
            <div>
              <p>會議模板</p>
              <h2>每次會議固定留下</h2>
            </div>
          </div>
          {["決議事項", "待補附件", "責任人", "完成日期", "是否影響關卡"].map((item) => (
            <div className="list-item" key={item}>
              <b>{item}</b>
              <small>納入小關任務清單，不獨立散落在會議紀錄裡。</small>
            </div>
          ))}
        </article>

        <article className="panel">
          <div className="section-title compact">
            <div>
              <p>協作規則</p>
              <h2>避免獨立設關</h2>
            </div>
          </div>
          <p className="plain-copy">
            會議、附件、資料確認、委員提問與一般協作都統一放入各小關任務清單。平台不另外產生孤立流程，避免同一件事被追兩次。
          </p>
        </article>
      </section>
    </AppShell>
  );
}
