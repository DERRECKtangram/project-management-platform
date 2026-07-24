import { AppShell } from "../components/AppShell";
import { actionItems, meetingRecords, projects } from "../data";

const reports = [
  {
    name: "送件前確認表",
    gate: "第一大關",
    scope: "成果範圍、工期資源、附件與正式送件版",
    status: "可產生",
  },
  {
    name: "啟動任務地圖",
    gate: "第二大關",
    scope: "核定差異、責任人、期限、成果與啟動障礙",
    status: "需補資料",
  },
  {
    name: "期中成果報告",
    gate: "第三大關",
    scope: "進度、成果附件、缺口原因、會議決議與委員意見",
    status: "草稿中",
  },
  {
    name: "結案封存包",
    gate: "第四大關",
    scope: "成果、KPI、經費附件、會議紀錄、回覆紀錄與版本封存",
    status: "待啟動",
  },
];

export default function ReportsPage() {
  return (
    <AppShell
      active="/reports"
      eyebrow="報告中心"
      title="依案件、關卡與會議紀錄自動彙整"
      actions={<button className="primary-action">產生報告</button>}
    >
      <section className="report-grid">
        {reports.map((report) => (
          <article className="report-card" key={report.name}>
            <span>{report.gate}</span>
            <h2>{report.name}</h2>
            <p>{report.scope}</p>
            <footer>
              <b>{report.status}</b>
              <button>查看</button>
            </footer>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="section-title">
          <div>
            <p>報告來源</p>
            <h2>目前可彙整案件</h2>
          </div>
        </div>
        <div className="project-table">
          {projects.map((project) => {
            const meetingCount = meetingRecords.filter((meeting) => meeting.project === project.name).length;
            const taskCount = actionItems.filter((item) => item.project === project.name).length;
            return (
              <div className="table-row" key={project.code}>
                <div>
                  <b>{project.name}</b>
                  <span>{project.stage}</span>
                </div>
                <span>PM：{project.manager}</span>
                <strong>{project.progress}%</strong>
                <span>{meetingCount} 筆會議 · {taskCount} 項任務</span>
              </div>
            );
          })}
        </div>
      </section>
    </AppShell>
  );
}
