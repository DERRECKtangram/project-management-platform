import Link from "next/link";
import { AppShell } from "../components/AppShell";
import { ReportSummary } from "../components/ReportSummary";

export default function SummaryPage() {
  return (
    <AppShell
      active="/summary"
      eyebrow="成果彙整"
      title="整合研發填報內容"
      actions={<Link className="secondary-action" href="/people">回研發填報</Link>}
    >
      <ReportSummary />
    </AppShell>
  );
}
