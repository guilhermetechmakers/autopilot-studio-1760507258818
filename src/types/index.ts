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
  version: number;
  template_id?: string;
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProposalInput {
  client_id: string;
  project_id?: string;
  title: string;
  content: string;
  value: number;
  template_id?: string;
  ai_generated?: boolean;
}

export interface UpdateProposalInput {
  id: string;
  title?: string;
  content?: string;
  status?: string;
  value?: number;
  template_id?: string;
}

export interface ProposalVersion {
  id: string;
  proposal_id: string;
  version: number;
  title: string;
  content: string;
  changes: string;
  created_by: string;
  created_at: string;
}

// SoW Template Types
export interface SoWTemplate {
  id: string;
  name: string;
  description: string;
  content: string;
  variables: string[];
  category: "web_development" | "mobile_app" | "ai_ml" | "consulting" | "custom";
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSoWTemplateInput {
  name: string;
  description: string;
  content: string;
  variables: string[];
  category: string;
}

// E-signature Types
export interface ESignature {
  id: string;
  proposal_id: string;
  signer_email: string;
  signer_name: string;
  status: "pending" | "signed" | "declined" | "expired";
  sent_at: string;
  signed_at?: string;
  expires_at: string;
  signature_data?: string;
  ip_address?: string;
  user_agent?: string;
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

// Authentication Types
export interface LoginCredentials {
  email: string;
  password: string;
  remember_me?: boolean;
}

export interface SignupCredentials {
  email: string;
  password: string;
  full_name: string;
  company?: string;
  role: "admin" | "manager" | "developer" | "client";
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export interface PasswordResetRequest {
  email: string;
}

export interface PasswordResetConfirm {
  token: string;
  password: string;
  confirm_password: string;
}

export interface EmailVerificationRequest {
  email: string;
}

export interface OAuthProvider {
  name: "google" | "github";
  display_name: string;
  icon: string;
  url: string;
}

export interface AuthError {
  message: string;
  code: string;
  field?: string;
}
