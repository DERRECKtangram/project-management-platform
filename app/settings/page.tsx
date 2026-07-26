import { AppShell } from "../components/AppShell";

const roles = [
  {
    name: "專案管理人員",
    duty: "建立專案、拆分四階段小關、指定負責窗口與期限，追蹤目前卡在哪一關。",
    permissions: ["建立專案", "新增小關", "分配窗口", "追蹤進度"],
  },
  {
    name: "研發人員",
    duty: "查看自己被分配的小關，填寫研發內容、更新狀態，並貼上成果文件連結。",
    permissions: ["查看任務", "填寫內容", "更新狀態", "貼上文件"],
  },
  {
    name: "管理層",
    duty: "查看專案是否持續推進、資源是否足夠，以及重要成果是否已補齊。",
    permissions: ["查看進度", "確認資源", "檢查缺口", "封存成果"],
  },
];

const rules = [
  "每個專案都要拆成提案、啟動、期中、期末四個階段。",
  "每個小關都要有負責窗口、內容說明、結束日期與目前狀態。",
  "研發人員只需要填自己負責的小關，狀態只保留未處理、進行中、已完成。",
  "完成後要貼上 Google 文件或雲端成果連結，方便計畫人員確認方向。",
  "只有必要成果與文件都補齊後，才視為該階段可以往下一步推進。",
];

export default function SettingsPage() {
  return (
    <AppShell
      active="/settings"
      eyebrow="設定"
      title="角色與流程規則"
      actions={<a className="secondary-action" href="/projects">回專案管理</a>}
    >
      <section className="role-grid">
        {roles.map((role) => (
          <article className="role-card" key={role.name}>
            <h2>{role.name}</h2>
            <p>{role.duty}</p>
            <div>
              {role.permissions.map((permission) => (
                <span key={permission}>{permission}</span>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="section-title compact">
          <div>
            <p>流程規則</p>
            <h2>讓專案管理與研發填報維持簡單一致</h2>
          </div>
        </div>
        {rules.map((rule, index) => (
          <div className="rule-row" key={rule}>
            <span>{index + 1}</span>
            <p>{rule}</p>
          </div>
        ))}
      </section>
    </AppShell>
  );
}
