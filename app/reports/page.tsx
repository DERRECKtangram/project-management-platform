import { AppShell } from "../components/AppShell";
import { ReportsSummary } from "../components/ReportsSummary";

export default function ReportsPage() {
  return (
    <AppShell
      active="/reports"
      eyebrow="報告中心"
      title="依專案、小關與文件狀態彙整交付缺口"
      actions={<button className="primary-action">產生報告</button>}
    >
      <ReportsSummary />
    </AppShell>
  );
}
