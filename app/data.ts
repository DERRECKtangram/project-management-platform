export type GateStatus = "done" | "active" | "risk" | "waiting";
export type RiskLevel = "低" | "中" | "高";
export type RoleType = "專案管理人員" | "開發人員" | "管理層";

export type Project = {
  code: string;
  name: string;
  agency: string;
  manager: string;
  developers: string[];
  stage: string;
  progress: number;
  risk: RiskLevel;
  due: string;
  budget: string;
  nextAction: string;
};

export type Member = {
  name: string;
  role: RoleType;
  team: string;
  focus: string;
  assigned: number;
  overdue: number;
};

export type GateStep = {
  gate: string;
  color: "amber" | "blue" | "violet" | "green";
  step: string;
  title: string;
  mission: string;
  condition: string;
  benefit: string;
  next: string;
  owner: string;
  assignee: string;
  status: GateStatus;
};

export type DocumentItem = {
  name: string;
  project: string;
  gate: string;
  status: "已收齊" | "需補件" | "待上傳" | "待確認";
  owner: string;
  updated: string;
};

export type ActionItem = {
  id: string;
  project: string;
  title: string;
  assignee: string;
  role: RoleType;
  sourceMeeting: string;
  due: string;
  status: "待處理" | "進行中" | "待確認" | "已完成";
  gate: string;
};

export type MeetingRecord = {
  id: string;
  title: string;
  project: string;
  date: string;
  chair: string;
  attendees: string[];
  decisions: string[];
  risks: string[];
  nextReview: string;
};

export const statusText: Record<GateStatus, string> = {
  done: "已完成",
  active: "進行中",
  risk: "有風險",
  waiting: "待啟動",
};

export const members: Member[] = [
  {
    name: "林怡君",
    role: "專案管理人員",
    team: "專案部門",
    focus: "案件排程、會議紀錄、附件追蹤與跨部門協調",
    assigned: 8,
    overdue: 1,
  },
  {
    name: "王柏翰",
    role: "開發人員",
    team: "RD / FAE",
    focus: "技術成果、測試數據、截圖與委員問題回覆",
    assigned: 5,
    overdue: 0,
  },
  {
    name: "張凱翔",
    role: "開發人員",
    team: "RD / FAE",
    focus: "資料串接、KPI 數據整理與結案技術佐證",
    assigned: 4,
    overdue: 1,
  },
  {
    name: "陳品妤",
    role: "專案管理人員",
    team: "專案部門",
    focus: "提案內容、送件版本、預算與附件清單",
    assigned: 6,
    overdue: 0,
  },
  {
    name: "黃總監",
    role: "管理層",
    team: "管理層",
    focus: "方向確認、資源決策、風險解除與封存核准",
    assigned: 3,
    overdue: 0,
  },
];

export const projects: Project[] = [
  {
    code: "GA-2026-014",
    name: "智慧空壓節能監測計畫",
    agency: "經濟部示範補助",
    manager: "林怡君",
    developers: ["王柏翰", "張凱翔"],
    stage: "第二大關：核定與正式啟動",
    progress: 47,
    risk: "高",
    due: "8 天後",
    budget: "480 萬",
    nextAction: "確認測試場域與設備採購時程",
  },
  {
    code: "GA-2026-019",
    name: "AI 品檢資料整合平台",
    agency: "產業升級專案",
    manager: "林怡君",
    developers: ["王柏翰"],
    stage: "第三大關：期中成果與審查",
    progress: 72,
    risk: "中",
    due: "17 天後",
    budget: "320 萬",
    nextAction: "補齊模型測試數據與委員回覆",
  },
  {
    code: "GA-2026-006",
    name: "低碳製程導入輔導案",
    agency: "地方型 SBIR",
    manager: "陳品妤",
    developers: ["張凱翔"],
    stage: "第一大關：提案與方向確認",
    progress: 28,
    risk: "低",
    due: "4 天後",
    budget: "150 萬",
    nextAction: "確認成果範圍與附件清單",
  },
  {
    code: "GA-2025-031",
    name: "智慧維運資料可視化計畫",
    agency: "數位轉型補助",
    manager: "陳品妤",
    developers: ["張凱翔"],
    stage: "第四大關：期末成果與結案",
    progress: 91,
    risk: "中",
    due: "21 天後",
    budget: "260 萬",
    nextAction: "收齊結案佐證並封存版本",
  },
];

export const gateSteps: GateStep[] = [
  {
    gate: "第一大關",
    color: "amber",
    step: "1",
    title: "確認成果範圍",
    mission: "整理申請需求、公司目標、技術成果與查核排除範圍。",
    condition: "目標、成果、範圍已由政府要求反推確認。",
    benefit: "避免臨時加功能與反覆修改需求。",
    next: "確認工期與資源",
    owner: "專案部門",
    assignee: "陳品妤",
    status: "done",
  },
  {
    gate: "第一大關",
    color: "amber",
    step: "2",
    title: "確認工期與資源",
    mission: "拆解技術工作、估算時間、確認人力設備預算與外部依賴。",
    condition: "工期與資源經執行人員確認，重大可行性問題已處理。",
    benefit: "避免開始後才發現來不及或缺人缺設備。",
    next: "只允許可執行案件進下一關",
    owner: "RD / FAE",
    assignee: "張凱翔",
    status: "active",
  },
  {
    gate: "第一大關",
    color: "amber",
    step: "3",
    title: "完成計畫書與送件",
    mission: "完成計畫書、查核點、附件與重大承諾，鎖版送件。",
    condition: "技術、工期、資源、附件皆確認，審查結果已保存。",
    benefit: "減少補件、版本混亂與重複說明。",
    next: "送出正式版本",
    owner: "管理層",
    assignee: "黃總監",
    status: "waiting",
  },
  {
    gate: "第二大關",
    color: "blue",
    step: "1",
    title: "確認核案差異",
    mission: "比對送件版與核定版，標示預算、時程、功能、KPI 與成果變更。",
    condition: "差異、技術影響、查核點與重大決策均已確認。",
    benefit: "避免用錯版本開始執行。",
    next: "建立任務與責任",
    owner: "專案部門",
    assignee: "林怡君",
    status: "done",
  },
  {
    gate: "第二大關",
    color: "blue",
    step: "2",
    title: "建立任務與責任",
    mission: "拆解必要工作，設定唯一負責人、期限、成果與任務順序。",
    condition: "每項工作皆有人、有期限、有明確成果。",
    benefit: "避免事情卡住時沒有人負責。",
    next: "查看任務地圖",
    owner: "專案管理人員",
    assignee: "林怡君",
    status: "active",
  },
  {
    gate: "第二大關",
    color: "blue",
    step: "3",
    title: "排除啟動障礙",
    mission: "確認資料、設備、場域、人力、預算、採購與合作條件。",
    condition: "啟動條件到位，缺口有等待對象與追蹤人。",
    benefit: "避免宣布啟動後仍在等待資源。",
    next: "開始執行",
    owner: "管理層",
    assignee: "黃總監",
    status: "risk",
  },
  {
    gate: "第三大關",
    color: "violet",
    step: "1",
    title: "執行工作並留下成果",
    mission: "更新進度、上傳數據、測試截圖、照片與相關文件。",
    condition: "已完成工作皆有成果證明，卡點有等待對象。",
    benefit: "期中前不用重新找資料或重寫內容。",
    next: "確認缺口與風險",
    owner: "開發人員",
    assignee: "王柏翰",
    status: "active",
  },
  {
    gate: "第三大關",
    color: "violet",
    step: "2",
    title: "確認缺口與風險",
    mission: "整理已完成、尚缺、待提供、3 天 / 7 天到期與逾期項。",
    condition: "每個缺口有負責人、處理方式與完成時間。",
    benefit: "提前發現缺少照片、數據或測試資料。",
    next: "處理期中缺口",
    owner: "專案管理人員",
    assignee: "林怡君",
    status: "risk",
  },
  {
    gate: "第三大關",
    color: "violet",
    step: "3",
    title: "完成並提交期中報告",
    mission: "彙整成果附件、進度與未完成事項，保存委員意見。",
    condition: "正確版本已提交，缺口原因、進度、日期與改善安排齊全。",
    benefit: "直接用平時成果完成報告。",
    next: "提交期中報告",
    owner: "專案部門",
    assignee: "林怡君",
    status: "waiting",
  },
  {
    gate: "第四大關",
    color: "green",
    step: "1",
    title: "完成剩餘成果與改善事項",
    mission: "完成技術工作、最終測試、數據與委員意見回覆。",
    condition: "必要成果完成或有合理說明，改善事項已安排結果。",
    benefit: "避免期末審查前大量補件。",
    next: "更新最終成果",
    owner: "開發人員",
    assignee: "張凱翔",
    status: "waiting",
  },
  {
    gate: "第四大關",
    color: "green",
    step: "2",
    title: "收齊結案資料",
    mission: "收齊技術成果、測試報告、數據、截圖、照片、KPI、經費與附件。",
    condition: "必要資料齊全或有正式說明，來源與版本清楚。",
    benefit: "避免最後找不到佐證。",
    next: "補齊結案資料",
    owner: "專案部門",
    assignee: "陳品妤",
    status: "waiting",
  },
  {
    gate: "第四大關",
    color: "green",
    step: "3",
    title: "完成結案報告與封存",
    mission: "彙整歷程、成果、KPI、差異、委員回覆，提交並封存。",
    condition: "報告提交、審查保存、資料封存且不可再隨意修改。",
    benefit: "保留工作證明，方便查核與延伸申請。",
    next: "完成結案並封存",
    owner: "管理層",
    assignee: "黃總監",
    status: "waiting",
  },
];

export const documents: DocumentItem[] = [
  {
    name: "核定版計畫書",
    project: "智慧空壓節能監測計畫",
    gate: "第二大關",
    status: "已收齊",
    owner: "林怡君",
    updated: "07/23",
  },
  {
    name: "設備採購與場域確認",
    project: "智慧空壓節能監測計畫",
    gate: "第二大關",
    status: "需補件",
    owner: "黃總監",
    updated: "07/24",
  },
  {
    name: "模型測試數據",
    project: "AI 品檢資料整合平台",
    gate: "第三大關",
    status: "待確認",
    owner: "王柏翰",
    updated: "07/22",
  },
  {
    name: "委員意見回覆表",
    project: "智慧維運資料可視化計畫",
    gate: "第四大關",
    status: "待上傳",
    owner: "張凱翔",
    updated: "07/21",
  },
];

export const meetingRecords: MeetingRecord[] = [
  {
    id: "MT-0725",
    title: "啟動前資源決策會",
    project: "智慧空壓節能監測計畫",
    date: "07/25 10:00",
    chair: "林怡君",
    attendees: ["林怡君", "王柏翰", "張凱翔", "黃總監"],
    decisions: ["採購窗口由管理層今日確認", "測試場域需在 3 天內完成可用性確認", "RD 需補完整設備需求規格"],
    risks: ["若設備採購延後，第二大關無法轉入正式執行"],
    nextReview: "07/28 16:00",
  },
  {
    id: "MT-0726",
    title: "期中缺口盤點",
    project: "AI 品檢資料整合平台",
    date: "07/26 14:30",
    chair: "林怡君",
    attendees: ["林怡君", "王柏翰", "黃總監"],
    decisions: ["模型測試數據改由王柏翰統一上傳", "委員問題回覆先用條列版，送出前由專案管理人員整併"],
    risks: ["若測試數據未附來源，期中報告可能被要求補件"],
    nextReview: "07/30 11:00",
  },
  {
    id: "MT-0729",
    title: "結案封存檢查",
    project: "智慧維運資料可視化計畫",
    date: "07/29 16:00",
    chair: "陳品妤",
    attendees: ["陳品妤", "張凱翔", "黃總監"],
    decisions: ["結案附件依成果、KPI、經費、委員回覆四類封存", "封存後僅管理層可核准修改"],
    risks: ["KPI 佐證若缺截圖，結案資料會被退補"],
    nextReview: "08/02 15:00",
  },
];

export const actionItems: ActionItem[] = [
  {
    id: "A-101",
    project: "智慧空壓節能監測計畫",
    title: "補齊設備需求規格與預算估算",
    assignee: "王柏翰",
    role: "開發人員",
    sourceMeeting: "啟動前資源決策會",
    due: "07/27",
    status: "進行中",
    gate: "第二大關",
  },
  {
    id: "A-102",
    project: "智慧空壓節能監測計畫",
    title: "確認採購窗口與測試場域可用日期",
    assignee: "黃總監",
    role: "管理層",
    sourceMeeting: "啟動前資源決策會",
    due: "07/25",
    status: "待處理",
    gate: "第二大關",
  },
  {
    id: "A-103",
    project: "AI 品檢資料整合平台",
    title: "上傳模型測試數據與截圖佐證",
    assignee: "王柏翰",
    role: "開發人員",
    sourceMeeting: "期中缺口盤點",
    due: "07/29",
    status: "待確認",
    gate: "第三大關",
  },
  {
    id: "A-104",
    project: "AI 品檢資料整合平台",
    title: "彙整委員問題回覆成期中報告附件",
    assignee: "林怡君",
    role: "專案管理人員",
    sourceMeeting: "期中缺口盤點",
    due: "07/30",
    status: "進行中",
    gate: "第三大關",
  },
  {
    id: "A-105",
    project: "智慧維運資料可視化計畫",
    title: "補齊 KPI 截圖與最終測試報告",
    assignee: "張凱翔",
    role: "開發人員",
    sourceMeeting: "結案封存檢查",
    due: "08/01",
    status: "待處理",
    gate: "第四大關",
  },
];

export const meetings = meetingRecords.map((meeting) => ({
  title: meeting.title,
  project: meeting.project,
  date: meeting.date,
  owner: meeting.chair,
  outcome: meeting.decisions[0],
}));
