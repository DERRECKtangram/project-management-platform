"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { WorkflowItem } from "./flowTypes";
import { useFlowData } from "./useFlowData";

const statuses = ["未處理", "進行中", "已完成"];

function statusClass(status: string) {
  if (status === "已完成") return "done";
  if (status === "進行中") return "active";
  return "waiting";
}

export function PeopleWorkload() {
  const { data, loading, message, setMessage, refresh } = useFlowData();
  const [owner, setOwner] = useState("全部窗口");
  const [projectCode, setProjectCode] = useState("全部專案");
  const [savingId, setSavingId] = useState("");

  const owners = useMemo(() => {
    const names = data.workflowItems.map((item) => item.owner || "未指定");
    return ["全部窗口", ...Array.from(new Set(names))];
  }, [data.workflowItems]);

  const projectOptions = useMemo(() => {
    return ["全部專案", ...data.projects.map((project) => project.code)];
  }, [data.projects]);

  const projectNameByCode = useMemo(() => {
    return new Map(data.projects.map((project) => [project.code, project.name]));
  }, [data.projects]);

  const visibleItems = useMemo(() => {
    return data.workflowItems
      .filter((item) => owner === "全部窗口" || item.owner === owner)
      .filter((item) => projectCode === "全部專案" || item.projectCode === projectCode)
      .sort((a, b) => {
        if (a.status === "已完成" && b.status !== "已完成") return 1;
        if (a.status !== "已完成" && b.status === "已完成") return -1;
        return a.dueDate.localeCompare(b.dueDate);
      });
  }, [data.workflowItems, owner, projectCode]);

  const people = useMemo(() => {
    const map = new Map<string, { name: string; total: number; done: number; missingDocs: number }>();
    data.workflowItems.forEach((item) => {
      const name = item.owner || "未指定";
      const current = map.get(name) ?? { name, total: 0, done: 0, missingDocs: 0 };
      current.total += 1;
      if (item.status === "已完成") current.done += 1;
      if (!item.documentUrl) current.missingDocs += 1;
      map.set(name, current);
    });
    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [data.workflowItems]);

  async function updateItem(item: WorkflowItem, patch: Partial<WorkflowItem>) {
    setSavingId(item.id);
    setMessage("");
    try {
      const response = await fetch("/api/flow", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, ...patch }),
      });
      const result = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(result.error || "更新失敗");
      }
      await refresh();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "更新失敗");
    } finally {
      setSavingId("");
    }
  }

  return (
    <>
      {message ? <p className="form-message left">{message}</p> : null}
      {loading ? <p className="plain-copy">讀取研發填報中...</p> : null}

      <section className="rd-toolbar panel">
        <div>
          <p>篩選填報內容</p>
          <h2>先選專案，再選窗口，只留下需要處理的小關</h2>
        </div>
        <div className="rd-filter-controls">
          <label>
            專案
            <select aria-label="選擇專案" onChange={(event) => setProjectCode(event.target.value)} value={projectCode}>
              {projectOptions.map((code) => (
                <option key={code} value={code}>
                  {code === "全部專案" ? code : projectNameByCode.get(code) ?? code}
                </option>
              ))}
            </select>
          </label>
          <label>
            窗口
            <select aria-label="選擇負責窗口" onChange={(event) => setOwner(event.target.value)} value={owner}>
              {owners.map((name) => (
                <option key={name}>{name}</option>
              ))}
            </select>
          </label>
        </div>
      </section>

      {!loading && people.length === 0 ? (
        <section className="panel empty-state">
          <h2>目前還沒有可填報的小關</h2>
          <p>請先由計畫人員在「專案管理」新增小關，並填入負責窗口。</p>
          <Link className="primary-action" href="/projects">前往專案管理</Link>
        </section>
      ) : null}

      <section className="people-grid light-people-grid">
        {people.map((person) => (
          <button
            className={owner === person.name ? "person-card selected-person" : "person-card"}
            key={person.name}
            onClick={() => setOwner(person.name)}
            type="button"
          >
            <div className="person-avatar">{person.name.slice(0, 1)}</div>
            <span>研發窗口</span>
            <h2>{person.name}</h2>
            <p>{person.done}/{person.total} 小關完成</p>
            <footer>
              <b>{person.total - person.done} 未完成</b>
              <strong>{person.missingDocs} 缺文件</strong>
            </footer>
          </button>
        ))}
      </section>

      <section className="rd-board">
        {visibleItems.map((item) => (
          <article className="rd-task-card" key={item.id}>
            <header>
              <span>{item.projectName}</span>
              <b className={statusClass(item.status)}>{item.status}</b>
            </header>
            <div className={`rd-phase-badge ${statusClass(item.status)}`}>{item.phase}</div>
            <h2>{item.title}</h2>
            <label>
              研發填報內容
              <textarea
                defaultValue={item.content === "待補內容" ? "" : item.content}
                onBlur={(event) => {
                  if (event.currentTarget.value !== item.content) {
                    void updateItem(item, { content: event.currentTarget.value });
                  }
                }}
                placeholder="寫下目前完成內容、討論結論、測試結果或需要 PM 知道的方向"
              />
            </label>
            <dl>
              <div>
                <dt>階段</dt>
                <dd>{item.phase}</dd>
              </div>
              <div>
                <dt>窗口</dt>
                <dd>{item.owner}</dd>
              </div>
              <div>
                <dt>期限</dt>
                <dd>{item.dueDate}</dd>
              </div>
            </dl>
            <label>
              文件或 Google 連結
              <input
                defaultValue={item.documentUrl}
                onBlur={(event) => {
                  if (event.currentTarget.value !== item.documentUrl) {
                    void updateItem(item, { documentUrl: event.currentTarget.value });
                  }
                }}
                placeholder="貼上成果文件連結"
              />
            </label>
            <div className="rd-actions">
              {statuses.map((status) => (
                <button
                  className={status === item.status ? "primary-action" : "secondary-action"}
                  disabled={savingId === item.id}
                  key={status}
                  onClick={() => void updateItem(item, { status })}
                  type="button"
                >
                  {status}
                </button>
              ))}
            </div>
          </article>
        ))}
      </section>
    </>
  );
}
