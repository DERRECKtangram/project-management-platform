import { AppShell } from "../components/AppShell";

const roles = [
  {
    name: "專案管理人員",
    duty: "建立案件、安排會議、把決議轉成任務、追蹤附件與跨部門進度。",
    permissions: ["建立案件", "新增會議紀錄", "分派任務", "彙整報告"],
  },
  {
    name: "開發人員",
    duty: "接收被分派的技術任務，回報成果、測試數據、截圖、設備需求與委員問題回覆。",
    permissions: ["更新任務", "上傳佐證", "回覆缺口", "確認技術成果"],
  },
  {
    name: "管理層",
    duty: "確認方向、資源、預算、重大風險與關卡是否可進入下一步。",
    permissions: ["核准關卡", "解除風險", "確認資源", "封存版本"],
  },
];

const rules = [
  "每次會議紀錄必須連到案件、關卡、負責人與下次追蹤日期。",
  "會議決議不能只留文字，必須轉成至少一項任務或明確標示無後續行動。",
  "開發人員只需要看到自己被分派的任務、期限、需交付成果與相關附件。",
  "專案管理人員需要看到所有卡點、逾期項、附件缺口與誰正在處理。",
  "只有完成當關主要任務與完成條件，才能進入下一關。",
];

export default function SettingsPage() {
  return (
    <AppShell
      active="/settings"
      eyebrow="角色與規則"
      title="讓不同人進入後看到不同責任"
      actions={<button className="secondary-action">調整設定</button>}
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
            <h2>避免會議後沒有人知道下一步</h2>
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
