// User Types
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: "admin" | "manager" | "developer" | "client";
  company?: string;
  created_at: string;
  updated_at: string;
}

export interface UpdateUserInput {
  id: string;
  full_name?: string;
  avatar_url?: string;
  company?: string;
}

// Project Types
export interface Project {
  id: string;
  name: string;
  description: string;
  client_id: string;
  status: "planning" | "active" | "on_hold" | "completed" | "cancelled";
  budget?: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectInput {
  name: string;
  description: string;
  client_id: string;
  budget?: number;
  start_date?: string;
  end_date?: string;
}

export interface UpdateProjectInput {
  id: string;
  name?: string;
  description?: string;
  status?: string;
  budget?: number;
  start_date?: string;
  end_date?: string;
}

// Milestone Types
export interface Milestone {
  id: string;
  project_id: string;
  name: string;
  description: string;
  status: "pending" | "in_progress" | "completed" | "cancelled";
  due_date?: string;
  completed_date?: string;
  billing_amount?: number;
  created_at: string;
  updated_at: string;
}

// Task Types
export interface Task {
  id: string;
  project_id: string;
  milestone_id?: string;
  title: string;
  description: string;
  status: "todo" | "in_progress" | "review" | "completed";
  priority: "low" | "medium" | "high" | "urgent";
  assignee_id?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

// Proposal Types
export interface Proposal {
  id: string;
  client_id: string;
  project_id?: string;
  title: string;
  content: string;
  status: "draft" | "sent" | "signed" | "rejected";
  value: number;
  sent_at?: string;
  signed_at?: string;
  created_at: string;
  updated_at: string;
}

// Time Tracking Types
export interface TimeEntry {
  id: string;
  user_id: string;
  project_id: string;
  task_id?: string;
  description: string;
  start_time: string;
  end_time?: string;
  duration: number; // in minutes
  billable: boolean;
  hourly_rate?: number;
  created_at: string;
  updated_at: string;
}

// Invoice Types
export interface Invoice {
  id: string;
  project_id: string;
  client_id: string;
  number: string;
  status: "draft" | "sent" | "paid" | "overdue" | "cancelled";
  amount: number;
  due_date: string;
  sent_at?: string;
  paid_at?: string;
  created_at: string;
  updated_at: string;
}

// AI Copilot Types
export interface AICopilotArtifact {
  id: string;
  type: "specification" | "acceptance_criteria" | "change_request" | "test_case" | "documentation";
  title: string;
  content: string;
  project_id?: string;
  status: "draft" | "review" | "approved" | "rejected";
  reviewer_id?: string;
  created_at: string;
  updated_at: string;
}

// Intake Types
export interface Intake {
  id: string;
  client_name: string;
  client_email: string;
  company?: string;
  project_type: string;
  budget_range: string;
  timeline: string;
  requirements: string;
  status: "new" | "qualified" | "proposal_sent" | "signed" | "rejected";
  qualification_score?: number;
  created_at: string;
  updated_at: string;
}
