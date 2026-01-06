
export enum TaskStatus {
  NOT_STARTED = 'Not Started',
  IN_PROGRESS = 'In Progress',
  COMPLETED = 'Completed',
  ON_HOLD = 'On Hold'
}

export interface Comment {
  id: string;
  user: string;
  text: string;
  timestamp: string;
}

export interface SubTask {
  id: string;
  subTaskId: string; // e.g. SP01-01
  category: string;  // Linked to Legend Label
  taskType: string;  // e.g. Pre-Wire, Trim, Install, Program, Single
  details: string;
  productName: string;
  isCompleted: boolean;
  comments: Comment[];
  photos: string[]; // Base64 strings
}

export interface Task {
  id: string;
  mapId: string; // e.g., SP01
  name: string;  // e.g., SP01
  type: string;  // From legend label
  subTasks: SubTask[];
  createdAt: string;
  comments: Comment[];
  photos: string[]; // Base64 strings
}

export interface LegendTemplate {
  id: string;
  label: string;
  icon: string;
  matchKeys: string[]; // e.g., ["D", "DATA"]
  baseSubTasks: Omit<SubTask, 'id' | 'subTaskId' | 'isCompleted' | 'comments' | 'photos'>[];
}

export interface Project {
  id: string;
  name: string;
  description: string;
  tasks: Task[];
  templates: LegendTemplate[];
  createdAt: string;
  slackChannelId?: string;
}

export interface OCRResult {
  mapId: string;
  type: string;
}

export interface AppSettings {
  slackApiToken: string;
  slackClientId?: string;
  slackClientSecret?: string;
}
