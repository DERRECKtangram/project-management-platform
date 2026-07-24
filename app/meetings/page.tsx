import { AppShell } from "../components/AppShell";
import { actionItems, meetingRecords } from "../data";

export default function MeetingsPage() {
  return (
    <AppShell
      active="/meetings"
      eyebrow="會議紀錄"
      title="把每次會議轉成專案流程紀錄與後續任務"
      actions={<button className="primary-action">新增會議紀錄</button>}
    >
      <section className="meeting-records">
        {meetingRecords.map((meeting) => {
          const tasks = actionItems.filter((item) => item.sourceMeeting === meeting.title);
          return (
            <article className="meeting-record-card" key={meeting.id}>
              <header>
                <div>
                  <span>{meeting.id} · {meeting.date}</span>
                  <h2>{meeting.title}</h2>
                  <p>{meeting.project}</p>
                </div>
                <strong>主持：{meeting.chair}</strong>
              </header>

              <div className="meeting-columns">
                <section>
                  <h3>參與人員</h3>
                  <div className="tag-list">
                    {meeting.attendees.map((person) => (
                      <span key={person}>{person}</span>
                    ))}
                  </div>
                </section>
                <section>
                  <h3>會議決議</h3>
                  {meeting.decisions.map((decision) => (
                    <p key={decision}>{decision}</p>
                  ))}
                </section>
                <section>
                  <h3>風險與卡點</h3>
                  {meeting.risks.map((risk) => (
                    <p key={risk}>{risk}</p>
                  ))}
                </section>
              </div>

              <section className="meeting-task-list">
                <div className="section-title compact">
                  <div>
                    <p>會後任務</p>
                    <h3>分派給負責人</h3>
                  </div>
                  <b>下次追蹤：{meeting.nextReview}</b>
                </div>
                {tasks.map((task) => (
                  <div className="task-row" key={task.id}>
                    <span>{task.id}</span>
                    <div>
                      <b>{task.title}</b>
                      <small>{task.gate} · {task.role}</small>
                    </div>
                    <strong>{task.assignee}</strong>
                    <em>{task.due}</em>
                  </div>
                ))}
              </section>
            </article>
          );
        })}
      </section>

      <section className="dashboard-grid">
        <article className="panel">
          <div className="section-title compact">
            <div>
              <p>會議紀錄格式</p>
              <h2>每次會後固定留下</h2>
            </div>
          </div>
          {["決議事項", "風險與卡點", "責任人", "完成日期", "下次追蹤時間", "影響哪一關"].map((item) => (
            <div className="list-item" key={item}>
              <b>{item}</b>
              <small>會議結束後直接轉入任務清單，讓專案管理人員與開發人員都知道下一步。</small>
            </div>
          ))}
        </article>

        <article className="panel">
          <div className="section-title compact">
            <div>
              <p>管理原則</p>
              <h2>會議不是單純存檔</h2>
            </div>
          </div>
          <p className="plain-copy">
            會議紀錄必須連到案件、關卡、附件與負責人。平台的重點是把會議內容變成可追蹤的下一步，而不是只留下文字紀錄。
          </p>
        </article>
      </section>
    </AppShell>
  );
}
