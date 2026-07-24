"use client";

import { useEffect, useState } from "react";
import type { ActionItem, Member } from "../data";

type WorkspacePayload = {
  members: Member[];
  actionItems: ActionItem[];
};

type TaskBoardProps = {
  initialMembers: Member[];
  initialTasks: ActionItem[];
};

const statuses = ["待處理", "進行中", "待確認", "已完成"];

export function TaskBoard({ initialMembers, initialTasks }: TaskBoardProps) {
  const [members, setMembers] = useState(initialMembers);
  const [tasks, setTasks] = useState(initialTasks);
  const [message, setMessage] = useState("任務狀態會儲存在 Cloudflare D1。");

  useEffect(() => {
    fetch("/api/workspace")
      .then((response) => response.json())
      .then((payload: WorkspacePayload & { error?: string }) => {
        if (payload.error) {
          setMessage(payload.error);
          return;
        }
        setMembers(payload.members);
        setTasks(payload.actionItems);
        setMessage("已連上資料庫，可以更新任務狀態。");
      })
      .catch(() => setMessage("目前使用頁面內建資料；部署後會連到 Cloudflare D1。"));
  }, []);

  async function changeStatus(id: string, status: string) {
    setMessage("正在更新任務狀態...");
    const previous = tasks;
    setTasks((current) => current.map((task) => task.id === id ? { ...task, status: status as ActionItem["status"] } : task));

    try {
      const response = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      const payload = (await response.json()) as { task?: ActionItem; error?: string };
      if (!response.ok || payload.error || !payload.task) {
        setTasks(previous);
        setMessage(payload.error ?? "更新失敗。");
        return;
      }
      setMessage("任務狀態已更新。");
    } catch {
      setTasks(previous);
      setMessage("更新失敗，請稍後再試。");
    }
  }

  const managerTasks = tasks.filter((item) => item.role === "專案管理人員");
  const developerTasks = tasks.filter((item) => item.role === "開發人員");

  return (
    <>
      <section className="role-entry-grid">
        <article className="entry-card manager-entry">
          <span>專案管理人員入口</span>
          <h2>追流程、補資料、確認下一步</h2>
          <p>負責把會議決議、附件缺口、期限與跨部門協作整理成可追蹤任務。</p>
          <strong>{managerTasks.length} 項會後任務</strong>
        </article>
        <article className="entry-card developer-entry">
          <span>開發人員入口</span>
          <h2>看自己要交付的技術成果</h2>
          <p>負責測試數據、技術成果、截圖、設備需求、KPI 佐證與委員問題回覆。</p>
          <strong>{developerTasks.length} 項技術任務</strong>
        </article>
      </section>

      <section className="people-grid">
        {members.map((member) => (
          <article className="person-card" key={member.name}>
            <div className="person-avatar">{member.name.slice(0, 1)}</div>
            <div>
              <span>{member.role}</span>
              <h2>{member.name}</h2>
              <p>{member.team}</p>
            </div>
            <p>{member.focus}</p>
            <footer>
              <b>{tasks.filter((task) => task.assignee === member.name).length} 項任務</b>
              <strong>{member.overdue} 項逾期</strong>
            </footer>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="section-title">
          <div>
            <p>任務狀態</p>
            <h2>可以直接更新負責人的工作進度</h2>
          </div>
          <strong className="form-message">{message}</strong>
        </div>
        {tasks.map((item) => (
          <div className="task-row editable-task-row" key={item.id}>
            <span>{item.id}</span>
            <div>
              <b>{item.title}</b>
              <small>{item.project} · 來源：{item.sourceMeeting} · {item.gate}</small>
            </div>
            <strong>{item.assignee}</strong>
            <select aria-label={`${item.title} 狀態`} value={item.status} onChange={(event) => changeStatus(item.id, event.target.value)}>
              {statuses.map((status) => (
                <option key={status}>{status}</option>
              ))}
            </select>
          </div>
        ))}
      </section>
    </>
  );
}
