import { AppShell } from "../components/AppShell";
import { projects } from "../data";

export default function ProjectsPage() {
  return (
    <AppShell
      active="/projects"
      eyebrow="案件管理"
      title="專案清單與執行狀態"
      actions={<button className="primary-action">建立新案件</button>}
    >
      <section className="toolbar">
        <input aria-label="搜尋案件" placeholder="搜尋案件名稱、代號、承辦人" />
        <select aria-label="篩選階段" defaultValue="all">
          <option value="all">全部階段</option>
          <option value="proposal">提案與方向確認</option>
          <option value="launch">核定與正式啟動</option>
          <option value="midterm">期中成果與審查</option>
          <option value="close">期末成果與結案</option>
        </select>
      </section>

      <section className="project-board">
        {projects.map((project) => (
          <article className="project-detail-card" key={project.code}>
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
                <dt>承辦人</dt>
                <dd>{project.owner}</dd>
              </div>
              <div>
                <dt>預算</dt>
                <dd>{project.budget}</dd>
              </div>
              <div>
                <dt>期限</dt>
                <dd>{project.due}</dd>
              </div>
            </dl>
            <footer>
              <span>下一步</span>
              <strong>{project.nextAction}</strong>
            </footer>
          </article>
        ))}
      </section>
    </AppShell>
  );
}
