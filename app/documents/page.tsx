import { AppShell } from "../components/AppShell";
import { documents } from "../data";

export default function DocumentsPage() {
  return (
    <AppShell
      active="/documents"
      eyebrow="附件資料庫"
      title="每份附件都要知道誰負責、卡在哪一關"
      actions={<button className="primary-action">上傳附件</button>}
    >
      <section className="toolbar">
        <input aria-label="搜尋附件" placeholder="搜尋附件、案件或負責人" />
        <select aria-label="附件狀態" defaultValue="all">
          <option value="all">全部狀態</option>
          <option value="done">已收齊</option>
          <option value="missing">需補件</option>
          <option value="pending">待上傳</option>
        </select>
      </section>

      <section className="panel">
        <div className="data-table">
          <div className="table-heading">
            <span>附件名稱</span>
            <span>案件</span>
            <span>關卡</span>
            <span>狀態</span>
            <span>負責</span>
            <span>更新</span>
          </div>
          {documents.map((doc) => (
            <div className="table-heading data-row" key={doc.name}>
              <b>{doc.name}</b>
              <span>{doc.project}</span>
              <span>{doc.gate}</span>
              <strong>{doc.status}</strong>
              <span>{doc.owner}</span>
              <span>{doc.updated}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="document-rules">
        <article>
          <h2>開會後</h2>
          <p>會議決議如果提到附件、數據或截圖，必須立刻建立負責人與期限。</p>
        </article>
        <article>
          <h2>送審前</h2>
          <p>計畫書、成果範圍、工期資源、預算與附件清單都要有正式版本。</p>
        </article>
        <article>
          <h2>結案前</h2>
          <p>成果、KPI、委員回覆、經費附件與歷史紀錄要封存，避免日後查核找不到依據。</p>
        </article>
      </section>
    </AppShell>
  );
}
