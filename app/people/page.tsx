import Link from "next/link";
import { AppShell } from "../components/AppShell";
import { PeopleWorkload } from "../components/PeopleWorkload";

export default function PeoplePage() {
  return (
    <AppShell
      active="/people"
      eyebrow="人員任務"
      title="依負責窗口整理每個人的小關、期限與文件缺口"
      actions={<Link className="primary-action" href="/projects">新增小關</Link>}
    >
      <PeopleWorkload />
    </AppShell>
  );
}
