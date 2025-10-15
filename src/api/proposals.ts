import { api } from "@/lib/api";
import type { ApiResponse, PaginatedResponse } from "@/lib/api";
import type { 
  Proposal, 
  CreateProposalInput, 
  UpdateProposalInput, 
  ProposalVersion,
  SoWTemplate,
  CreateSoWTemplateInput,
  ESignature
} from "@/types";

// Proposals API
export const proposalsApi = {
  // Get all proposals with pagination and filters
  getProposals: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    client_id?: string;
    search?: string;
  }): Promise<PaginatedResponse<Proposal>> => {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.append("page", params.page.toString());
    if (params?.limit) searchParams.append("limit", params.limit.toString());
    if (params?.status) searchParams.append("status", params.status);
    if (params?.client_id) searchParams.append("client_id", params.client_id);
    if (params?.search) searchParams.append("search", params.search);
    
    const queryString = searchParams.toString();
    return api.get<PaginatedResponse<Proposal>>(`/proposals${queryString ? `?${queryString}` : ""}`);
  },

  // Get single proposal by ID
  getProposal: async (id: string): Promise<ApiResponse<Proposal>> => {
    return api.get<ApiResponse<Proposal>>(`/proposals/${id}`);
  },

  // Create new proposal
  createProposal: async (data: CreateProposalInput): Promise<ApiResponse<Proposal>> => {
    return api.post<ApiResponse<Proposal>>("/proposals", data);
  },

  // Update proposal
  updateProposal: async (data: UpdateProposalInput): Promise<ApiResponse<Proposal>> => {
    return api.put<ApiResponse<Proposal>>(`/proposals/${data.id}`, data);
  },

  // Delete proposal
  deleteProposal: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete(`/proposals/${id}`) as Promise<ApiResponse<void>>;
  },

  // Get proposal versions
  getProposalVersions: async (proposalId: string): Promise<ApiResponse<ProposalVersion[]>> => {
    return api.get<ApiResponse<ProposalVersion[]>>(`/proposals/${proposalId}/versions`);
  },

  // Create new version
  createProposalVersion: async (proposalId: string, data: {
    title: string;
    content: string;
    changes: string;
  }): Promise<ApiResponse<ProposalVersion>> => {
    return api.post<ApiResponse<ProposalVersion>>(`/proposals/${proposalId}/versions`, data);
  },

  // Send proposal for signature
  sendForSignature: async (proposalId: string, data: {
    signer_email: string;
    signer_name: string;
    expires_in_days?: number;
  }): Promise<ApiResponse<ESignature>> => {
    return api.post<ApiResponse<ESignature>>(`/proposals/${proposalId}/send`, data);
  },

  // Get signature status
  getSignatureStatus: async (proposalId: string): Promise<ApiResponse<ESignature>> => {
    return api.get<ApiResponse<ESignature>>(`/proposals/${proposalId}/signature`);
  },

  // Generate AI proposal
  generateAIProposal: async (data: {
    client_id: string;
    project_id?: string;
    requirements: string;
    budget_range?: string;
    timeline?: string;
  }): Promise<ApiResponse<Proposal>> => {
    return api.post<ApiResponse<Proposal>>("/proposals/generate-ai", data);
  },
};

// SoW Templates API
export const templatesApi = {
  // Get all templates
  getTemplates: async (params?: {
    category?: string;
    is_active?: boolean;
  }): Promise<ApiResponse<SoWTemplate[]>> => {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append("category", params.category);
    if (params?.is_active !== undefined) searchParams.append("is_active", params.is_active.toString());
    
    const queryString = searchParams.toString();
    return api.get<ApiResponse<SoWTemplate[]>>(`/templates${queryString ? `?${queryString}` : ""}`);
  },

  // Get single template
  getTemplate: async (id: string): Promise<ApiResponse<SoWTemplate>> => {
    return api.get<ApiResponse<SoWTemplate>>(`/templates/${id}`);
  },

  // Create new template
  createTemplate: async (data: CreateSoWTemplateInput): Promise<ApiResponse<SoWTemplate>> => {
    return api.post<ApiResponse<SoWTemplate>>("/templates", data);
  },

  // Update template
  updateTemplate: async (id: string, data: Partial<CreateSoWTemplateInput>): Promise<ApiResponse<SoWTemplate>> => {
    return api.put<ApiResponse<SoWTemplate>>(`/templates/${id}`, data);
  },

  // Delete template
  deleteTemplate: async (id: string): Promise<ApiResponse<void>> => {
    return api.delete(`/templates/${id}`) as Promise<ApiResponse<void>>;
  },

  // Generate proposal from template
  generateFromTemplate: async (templateId: string, variables: Record<string, string>): Promise<ApiResponse<Proposal>> => {
    return api.post<ApiResponse<Proposal>>(`/templates/${templateId}/generate`, { variables });
  },
};
