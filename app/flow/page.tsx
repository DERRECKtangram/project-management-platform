import { AppShell } from "../components/AppShell";
import { FlowManager } from "../components/FlowManager";

export default function FlowPage() {
  return (
    <AppShell
      active="/flow"
      eyebrow="流程管理"
      title="用四階段小關對齊計畫人員與研發人員"
      actions={<a className="secondary-action" href="/meetings">查看會議紀錄</a>}
    >
      <FlowManager />
    </AppShell>
  );
}
