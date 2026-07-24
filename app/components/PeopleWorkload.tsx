"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useFlowData } from "./useFlowData";

export function PeopleWorkload() {
  const { data, loading, message } = useFlowData();

  const people = useMemo(() => {
    const map = new Map<string, { name: string; roles: Set<string>; total: number; done: number; items: typeof data.workflowItems }>();
    data.workflowItems.forEach((item) => {
      const name = item.owner || "未指定";
      const current = map.get(name) ?? { name, roles: new Set<string>(), total: 0, done: 0, items: [] };
      current.roles.add(item.role);
      current.total += 1;
      if (item.status === "已完成") current.done += 1;
      current.items.push(item);
      map.set(name, current);
    });
    return [...map.values()].sort((a, b) => b.total - a.total);
  }, [data.workflowItems]);

  return (
    <>
      {message ? <p className="form-message left">{message}</p> : null}
      {loading ? <p className="plain-copy">讀取人員任務中...</p> : null}
      {!loading && people.length === 0 ? (
        <section className="panel empty-state">
          <h2>目前還沒有分配窗口</h2>
          <p>請先到專案內新增小關，並填入負責窗口。</p>
          <Link className="primary-action" href="/projects">前往專案</Link>
        </section>
      ) : null}
      <section className="people-grid">
        {people.map((person) => (
          <article className="person-card" key={person.name}>
            <div className="person-avatar">{person.name.slice(0, 1)}</div>
            <span>{[...person.roles].join("、")}</span>
            <h2>{person.name}</h2>
            <p>{person.done}/{person.total} 小關完成</p>
            <footer>
              <b>{person.total - person.done} 待處理</b>
              <strong>{person.items.filter((item) => !item.documentUrl).length} 缺文件</strong>
            </footer>
          </article>
        ))}
      </section>
      <section className="panel">
        <div className="section-title">
          <div>
            <p>所有分配</p>
            <h2>依窗口追蹤責任、期限與文件</h2>
          </div>
        </div>
        {data.workflowItems.map((item) => (
          <Link className="task-row clickable-row" href={`/projects/${encodeURIComponent(item.projectCode)}`} key={item.id}>
            <span>{item.phase}</span>
            <div>
              <b>{item.title}</b>
              <small>{item.projectName} / {item.content}</small>
            </div>
            <strong>{item.owner}</strong>
            <em>{item.dueDate}</em>
          </Link>
        ))}
      </section>
    </>
  );
}
