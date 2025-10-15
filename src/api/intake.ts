import { api } from "@/lib/api";
import type { ApiResponse } from "@/lib/api";
import type {
  Intake,
  IntakeSession,
  IntakeQuestion,
  IntakeResponse,
  IntakeFormData,
} from "@/types";

// Intake API endpoints
export const intakeApi = {
  // Create a new intake session
  createSession: async (): Promise<ApiResponse<IntakeSession>> => {
    return api.post<ApiResponse<IntakeSession>>("/intake/session", {});
  },

  // Get intake questions
  getQuestions: async (): Promise<ApiResponse<IntakeQuestion[]>> => {
    return api.get<ApiResponse<IntakeQuestion[]>>("/intake/questions");
  },

  // Submit a response to a question
  submitResponse: async (
    sessionId: string,
    response: IntakeResponse
  ): Promise<ApiResponse<IntakeSession>> => {
    return api.post<ApiResponse<IntakeSession>>(
      `/intake/session/${sessionId}/response`,
      response
    );
  },

  // Get AI suggestions based on current responses
  getAISuggestions: async (
    sessionId: string
  ): Promise<ApiResponse<{ suggestions: string[]; next_questions: IntakeQuestion[] }>> => {
    return api.get<ApiResponse<{ suggestions: string[]; next_questions: IntakeQuestion[] }>>(
      `/intake/session/${sessionId}/ai-suggestions`
    );
  },

  // Calculate qualification score
  calculateQualificationScore: async (
    sessionId: string
  ): Promise<ApiResponse<{ score: number; factors: string[] }>> => {
    return api.get<ApiResponse<{ score: number; factors: string[] }>>(
      `/intake/session/${sessionId}/qualification-score`
    );
  },

  // Submit completed intake form
  submitIntake: async (
    sessionId: string,
    formData: IntakeFormData
  ): Promise<ApiResponse<Intake>> => {
    return api.post<ApiResponse<Intake>>(`/intake/session/${sessionId}/submit`, formData);
  },

  // Get intake by ID
  getIntake: async (id: string): Promise<ApiResponse<Intake>> => {
    return api.get<ApiResponse<Intake>>(`/intake/${id}`);
  },

  // Get all intakes (for admin/dashboard)
  getIntakes: async (params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<ApiResponse<{ intakes: Intake[]; total: number; page: number; limit: number }>> => {
    const queryParams = new URLSearchParams();
    if (params?.status) queryParams.append("status", params.status);
    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    
    const queryString = queryParams.toString();
    const endpoint = queryString ? `/intake?${queryString}` : "/intake";
    
    return api.get<ApiResponse<{ intakes: Intake[]; total: number; page: number; limit: number }>>(endpoint);
  },

  // Update intake status
  updateIntakeStatus: async (
    id: string,
    status: string
  ): Promise<ApiResponse<Intake>> => {
    return api.put<ApiResponse<Intake>>(`/intake/${id}/status`, { status });
  },

  // Delete intake
  deleteIntake: async (id: string): Promise<void> => {
    await api.delete(`/intake/${id}`);
  },

  // Upload files for intake
  uploadFiles: async (
    sessionId: string,
    files: File[]
  ): Promise<ApiResponse<{ file_urls: string[] }>> => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append(`file_${index}`, file);
    });

    return api.post<ApiResponse<{ file_urls: string[] }>>(
      `/intake/session/${sessionId}/upload`,
      formData
    );
  },

  // Get intake analytics (for dashboard)
  getIntakeAnalytics: async (): Promise<ApiResponse<{
    total_intakes: number;
    qualified_intakes: number;
    conversion_rate: number;
    avg_qualification_score: number;
    intakes_by_status: Record<string, number>;
    intakes_by_month: Array<{ month: string; count: number }>;
  }>> => {
    return api.get<ApiResponse<{
      total_intakes: number;
      qualified_intakes: number;
      conversion_rate: number;
      avg_qualification_score: number;
      intakes_by_status: Record<string, number>;
      intakes_by_month: Array<{ month: string; count: number }>;
    }>>("/intake/analytics");
  },
};
