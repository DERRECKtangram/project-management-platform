"use client";

import { useEffect, useMemo, useState } from "react";
import type { ActionItem, MeetingRecord, Project } from "../data";

type WorkspacePayload = {
  projects: Project[];
  meetingRecords: MeetingRecord[];
  actionItems: ActionItem[];
};

type MeetingManagerProps = {
  initialProjects: Project[];
  initialMeetings: MeetingRecord[];
  initialTasks: ActionItem[];
};

const emptyForm = {
  title: "",
  project: "",
  date: "",
  chair: "",
  attendees: "",
  decisions: "",
  risks: "",
  nextReview: "",
  taskTitle: "",
  taskAssignee: "",
  taskRole: "專案管理人員",
  taskDue: "",
  taskGate: "第二大關",
};

export function MeetingManager({ initialProjects, initialMeetings, initialTasks }: MeetingManagerProps) {
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [meetings, setMeetings] = useState<MeetingRecord[]>(initialMeetings);
  const [tasks, setTasks] = useState<ActionItem[]>(initialTasks);
  const [form, setForm] = useState(emptyForm);
  const [message, setMessage] = useState("資料會儲存在 Cloudflare D1。");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/workspace")
      .then((response) => response.json())
      .then((payload: WorkspacePayload & { error?: string }) => {
        if (payload.error) {
          setMessage(payload.error);
          return;
        }
        setProjects(payload.projects);
        setMeetings(payload.meetingRecords);
        setTasks(payload.actionItems);
        setMessage("已連上資料庫。新增會議後重新整理也會保留。");
      })
      .catch(() => setMessage("目前使用頁面內建資料；部署後會連到 Cloudflare D1。"));
  }, []);

  const projectNames = useMemo(() => projects.map((project) => project.name), [projects]);

  async function submitMeeting(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setMessage("正在儲存會議紀錄...");

    try {
      const response = await fetch("/api/meetings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const payload = (await response.json()) as {
        meeting?: MeetingRecord;
        task?: ActionItem | null;
        error?: string;
      };

      if (!response.ok || payload.error || !payload.meeting) {
        setMessage(payload.error ?? "儲存失敗。");
        return;
      }

      setMeetings((current) => [payload.meeting!, ...current]);
      if (payload.task) {
        setTasks((current) => [payload.task!, ...current]);
      }
      setForm(emptyForm);
      setMessage("會議已儲存，後續任務也已建立。");
    } catch {
      setMessage("儲存失敗，請稍後再試。");
    } finally {
      setSaving(false);
    }
  }

  function updateField(field: keyof typeof emptyForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <>
      <section className="panel meeting-form-panel">
        <div className="section-title">
          <div>
            <p>新增會議紀錄</p>
            <h2>開完會後直接建立後續任務</h2>
          </div>
          <strong className="form-message">{message}</strong>
        </div>
        <form className="meeting-form" onSubmit={submitMeeting}>
          <label>
            會議名稱
            <input value={form.title} onChange={(event) => updateField("title", event.target.value)} required />
          </label>
          <label>
            專案
            <select value={form.project} onChange={(event) => updateField("project", event.target.value)} required>
              <option value="">選擇案件</option>
              {projectNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </label>
          <label>
            會議時間
            <input value={form.date} onChange={(event) => updateField("date", event.target.value)} placeholder="07/30 14:00" />
          </label>
          <label>
            主持人
            <input value={form.chair} onChange={(event) => updateField("chair", event.target.value)} required />
          </label>
          <label className="wide-field">
            參與人員
            <input value={form.attendees} onChange={(event) => updateField("attendees", event.target.value)} placeholder="林怡君、王柏翰、黃總監" />
          </label>
          <label className="wide-field">
            會議決議
            <textarea value={form.decisions} onChange={(event) => updateField("decisions", event.target.value)} placeholder="每行一項決議" />
          </label>
          <label className="wide-field">
            風險與卡點
            <textarea value={form.risks} onChange={(event) => updateField("risks", event.target.value)} placeholder="每行一項風險" />
          </label>
          <label>
            下次追蹤
            <input value={form.nextReview} onChange={(event) => updateField("nextReview", event.target.value)} placeholder="08/02 10:00" />
          </label>
          <label>
            後續任務
            <input value={form.taskTitle} onChange={(event) => updateField("taskTitle", event.target.value)} placeholder="補齊測試數據" />
          </label>
          <label>
            任務負責人
            <input value={form.taskAssignee} onChange={(event) => updateField("taskAssignee", event.target.value)} placeholder="王柏翰" />
          </label>
          <label>
            負責角色
            <select value={form.taskRole} onChange={(event) => updateField("taskRole", event.target.value)}>
              <option>專案管理人員</option>
              <option>開發人員</option>
              <option>管理層</option>
            </select>
          </label>
          <label>
            任務期限
            <input value={form.taskDue} onChange={(event) => updateField("taskDue", event.target.value)} placeholder="08/01" />
          </label>
          <label>
            影響關卡
            <select value={form.taskGate} onChange={(event) => updateField("taskGate", event.target.value)}>
              <option>第一大關</option>
              <option>第二大關</option>
              <option>第三大關</option>
              <option>第四大關</option>
            </select>
          </label>
          <button className="primary-action" disabled={saving} type="submit">
            {saving ? "儲存中..." : "儲存會議並建立任務"}
          </button>
        </form>
      </section>

      <section className="meeting-records">
        {meetings.map((meeting) => {
          const meetingTasks = tasks.filter((item) => item.sourceMeeting === meeting.title);
          return (
            <article className="meeting-record-card" key={meeting.id}>
              <header>
                <div>
                  <span>{meeting.id} · {meeting.date}</span>
                  <h2>{meeting.title}</h2>
                  <p>{meeting.project}</p>
                </div>
                <strong>主持：{meeting.chair}</strong>
              </header>

              <div className="meeting-columns">
                <section>
                  <h3>參與人員</h3>
                  <div className="tag-list">
                    {meeting.attendees.map((person) => (
                      <span key={person}>{person}</span>
                    ))}
                  </div>
                </section>
                <section>
                  <h3>會議決議</h3>
                  {meeting.decisions.map((decision) => (
                    <p key={decision}>{decision}</p>
                  ))}
                </section>
                <section>
                  <h3>風險與卡點</h3>
                  {meeting.risks.length ? meeting.risks.map((risk) => <p key={risk}>{risk}</p>) : <p>無新增風險。</p>}
                </section>
              </div>

              <section className="meeting-task-list">
                <div className="section-title compact">
                  <div>
                    <p>會後任務</p>
                    <h3>分派給負責人</h3>
                  </div>
                  <b>下次追蹤：{meeting.nextReview}</b>
                </div>
                {meetingTasks.length ? meetingTasks.map((task) => (
                  <div className="task-row" key={task.id}>
                    <span>{task.id}</span>
                    <div>
                      <b>{task.title}</b>
                      <small>{task.gate} · {task.role}</small>
                    </div>
                    <strong>{task.assignee}</strong>
                    <em>{task.due}</em>
                  </div>
                )) : <p className="plain-copy">這次會議尚未建立後續任務。</p>}
              </section>
            </article>
          );
        })}
      </section>
    </>
  );
}
