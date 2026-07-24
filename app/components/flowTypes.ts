export type ProjectRecord = {
  code: string;
  name: string;
  agency: string;
  manager: string;
  developers: string[];
  stage: string;
  progress: number;
  risk: string;
  due: string;
  budget: string;
  nextAction: string;
  createdAt?: string;
};

export type WorkflowItem = {
  id: string;
  projectCode: string;
  projectName: string;
  phase: string;
  title: string;
  owner: string;
  role: string;
  content: string;
  dueDate: string;
  status: string;
  documentUrl: string;
  completedAt: string;
  createdAt?: string;
};

export type FlowData = {
  phases: string[];
  projects: ProjectRecord[];
  workflowItems: WorkflowItem[];
};

export const defaultFlowData: FlowData = {
  phases: ["提案", "啟動", "期中", "期末"],
  projects: [],
  workflowItems: [],
};
