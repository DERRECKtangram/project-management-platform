import Link from "next/link";
import { AppShell } from "../components/AppShell";
import { PeopleWorkload } from "../components/PeopleWorkload";

export default function PeoplePage() {
  return (
    <AppShell
      active="/people"
      eyebrow="研發填報"
      title="只看自己負責的小關，完成後貼上成果連結"
      actions={<Link className="secondary-action" href="/projects">回專案管理</Link>}
    >
      <PeopleWorkload />
    </AppShell>
  );
}
