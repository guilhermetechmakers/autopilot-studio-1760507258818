import { api } from "@/lib/api";
import type { ApiResponse, PaginatedResponse } from "@/lib/api";
import type { TimeEntry } from "@/types";

// Time Entry API Types
export interface CreateTimeEntryInput {
  project_id: string;
  task_id?: string;
  description: string;
  start_time: string;
  end_time?: string;
  duration?: number;
  billable: boolean;
  hourly_rate?: number;
}

export interface UpdateTimeEntryInput {
  id: string;
  description?: string;
  start_time?: string;
  end_time?: string;
  duration?: number;
  billable?: boolean;
  hourly_rate?: number;
}

export interface TimeEntryFilters {
  project_id?: string;
  task_id?: string;
  billable?: boolean;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface TimeTrackingStats {
  total_hours: number;
  billable_hours: number;
  non_billable_hours: number;
  total_earnings: number;
  active_timer?: TimeEntry;
}

// Time Tracking API Functions
export const timeTrackingApi = {
  // Get all time entries with optional filters
  getTimeEntries: async (filters?: TimeEntryFilters): Promise<ApiResponse<PaginatedResponse<TimeEntry>>> => {
    const params = new URLSearchParams();
    
    if (filters?.project_id) params.append('project_id', filters.project_id);
    if (filters?.task_id) params.append('task_id', filters.task_id);
    if (filters?.billable !== undefined) params.append('billable', filters.billable.toString());
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/time-tracking?${queryString}` : '/time-tracking';
    
    return api.get<ApiResponse<PaginatedResponse<TimeEntry>>>(endpoint);
  },

  // Get a single time entry
  getTimeEntry: async (id: string): Promise<ApiResponse<TimeEntry>> => {
    return api.get<ApiResponse<TimeEntry>>(`/time-tracking/${id}`);
  },

  // Create a new time entry
  createTimeEntry: async (data: CreateTimeEntryInput): Promise<ApiResponse<TimeEntry>> => {
    return api.post<ApiResponse<TimeEntry>>('/time-tracking', data);
  },

  // Update an existing time entry
  updateTimeEntry: async (data: UpdateTimeEntryInput): Promise<ApiResponse<TimeEntry>> => {
    return api.put<ApiResponse<TimeEntry>>(`/time-tracking/${data.id}`, data);
  },

  // Delete a time entry
  deleteTimeEntry: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete(`/time-tracking/${id}`) as Promise<ApiResponse<void>>;
  },

  // Start a timer (create entry with start_time only)
  startTimer: async (data: Omit<CreateTimeEntryInput, 'end_time' | 'duration'>): Promise<ApiResponse<TimeEntry>> => {
    return api.post<ApiResponse<TimeEntry>>('/time-tracking/start', data);
  },

  // Stop a timer (update entry with end_time and duration)
  stopTimer: async (id: string): Promise<ApiResponse<TimeEntry>> => {
    return api.post<ApiResponse<TimeEntry>>(`/time-tracking/${id}/stop`, {});
  },

  // Get active timer for current user
  getActiveTimer: async (): Promise<ApiResponse<TimeEntry | null>> => {
    return api.get<ApiResponse<TimeEntry | null>>('/time-tracking/active');
  },

  // Get time tracking statistics
  getStats: async (filters?: Omit<TimeEntryFilters, 'page' | 'limit'>): Promise<ApiResponse<TimeTrackingStats>> => {
    const params = new URLSearchParams();
    
    if (filters?.project_id) params.append('project_id', filters.project_id);
    if (filters?.task_id) params.append('task_id', filters.task_id);
    if (filters?.billable !== undefined) params.append('billable', filters.billable.toString());
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);

    const queryString = params.toString();
    const endpoint = queryString ? `/time-tracking/stats?${queryString}` : '/time-tracking/stats';
    
    return api.get<ApiResponse<TimeTrackingStats>>(endpoint);
  },

  // Export time entries to CSV
  exportTimeEntries: async (filters?: Omit<TimeEntryFilters, 'page' | 'limit'>): Promise<Blob> => {
    const params = new URLSearchParams();
    
    if (filters?.project_id) params.append('project_id', filters.project_id);
    if (filters?.task_id) params.append('task_id', filters.task_id);
    if (filters?.billable !== undefined) params.append('billable', filters.billable.toString());
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);

    const queryString = params.toString();
    const endpoint = queryString ? `/time-tracking/export?${queryString}` : '/time-tracking/export';
    
    const response = await fetch(`${import.meta.env.VITE_API_URL || "http://localhost:3000/api"}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to export time entries');
    }

    return response.blob();
  },
};
