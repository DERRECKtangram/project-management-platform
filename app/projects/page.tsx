import { AppShell } from "../components/AppShell";
import { actionItems, projects } from "../data";

export default function ProjectsPage() {
  return (
    <AppShell
      active="/projects"
      eyebrow="案件管理"
      title="每個案件都有 PM、開發人員與下一步"
      actions={<button className="primary-action">建立新案件</button>}
    >
      <section className="toolbar">
        <input aria-label="搜尋案件" placeholder="搜尋案件名稱、代號、PM 或開發人員" />
        <select aria-label="篩選階段" defaultValue="all">
          <option value="all">全部階段</option>
          <option value="proposal">提案與方向確認</option>
          <option value="launch">核定與正式啟動</option>
          <option value="midterm">期中成果與審查</option>
          <option value="close">期末成果與結案</option>
        </select>
      </section>

      <section className="project-board">
        {projects.map((project) => {
          const relatedTasks = actionItems.filter((item) => item.project === project.name);
          return (
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
                  <dt>專案管理</dt>
                  <dd>{project.manager}</dd>
                </div>
                <div>
                  <dt>開發負責</dt>
                  <dd>{project.developers.join("、")}</dd>
                </div>
                <div>
                  <dt>期限 / 預算</dt>
                  <dd>{project.due} · {project.budget}</dd>
                </div>
              </dl>
              <footer>
                <span>下一步</span>
                <strong>{project.nextAction}</strong>
                <small>會後待辦：{relatedTasks.length} 項</small>
              </footer>
            </article>
          );
        })}
      </section>
    </AppShell>
  );
}
