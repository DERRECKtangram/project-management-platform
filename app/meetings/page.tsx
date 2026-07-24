import { AppShell } from "../components/AppShell";
import { MeetingManager } from "../components/MeetingManager";
import { actionItems, meetingRecords, projects } from "../data";

export default function MeetingsPage() {
  return (
    <AppShell
      active="/meetings"
      eyebrow="會議紀錄"
      title="把每次會議轉成專案流程紀錄與後續任務"
      actions={<a className="secondary-action" href="/people">查看任務狀態</a>}
    >
      <MeetingManager
        initialProjects={projects}
        initialMeetings={meetingRecords}
        initialTasks={actionItems}
      />

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
