import { AppShell } from "../components/AppShell";
import { TaskBoard } from "../components/TaskBoard";
import { actionItems, members } from "../data";

export default function PeoplePage() {
  return (
    <AppShell
      active="/people"
      eyebrow="人員與任務"
      title="不同角色進入後看到自己的責任"
      actions={<a className="primary-action" href="/meetings">新增會議紀錄</a>}
    >
      <TaskBoard initialMembers={members} initialTasks={actionItems} />
    </AppShell>
  );
}
