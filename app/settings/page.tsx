import { AppShell } from "../components/AppShell";

const roles = [
  {
    name: "專案部門",
    duty: "統整推進、會議、附件、資料確認與跨部門追蹤。",
    permissions: ["建立案件", "管理關卡", "彙整報告"],
  },
  {
    name: "RD / FAE",
    duty: "提供技術內容、成果、測試數據、照片截圖與改善回覆。",
    permissions: ["更新任務", "上傳佐證", "回覆缺口"],
  },
  {
    name: "管理層",
    duty: "確認方向、資源、預算、重大風險與送審決策。",
    permissions: ["核准關卡", "解除風險", "封存版本"],
  },
];

const rules = [
  "只有完成當關主要任務與完成條件，才能進入下一關。",
  "期中不得使用退回修改狀態；部分成果未完成不阻止提交，但必須留下原因、改善安排與委員意見。",
  "期末不得使用退回修改；後續列為補充資料、改善事項或結案附件。",
  "會議、附件、資料確認、委員提問與一般協作統一放入小關任務清單。",
];

export default function SettingsPage() {
  return (
    <AppShell
      active="/settings"
      eyebrow="角色與規則"
      title="平台權責與通關規則"
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
            <p>通關規則</p>
            <h2>避免流程失控的底線</h2>
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
