import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { intakeApi } from "@/api/intake";
import type {
  IntakeFormData,
  IntakeResponse,
} from "@/types";

// Validation schema for intake form
const intakeFormSchema = z.object({
  // Basic Information
  client_name: z.string().min(2, "Name must be at least 2 characters"),
  client_email: z.string().email("Please enter a valid email address"),
  company: z.string().optional(),
  phone: z.string().optional(),
  
  // Project Details
  project_type: z.string().min(1, "Please select a project type"),
  project_description: z.string().min(10, "Please provide a detailed project description"),
  goals: z.string().min(10, "Please describe your project goals"),
  target_audience: z.string().optional(),
  
  // Technical Requirements
  tech_stack: z.array(z.string()).optional(),
  integrations: z.array(z.string()).optional(),
  platforms: z.array(z.string()).min(1, "Please select at least one platform"),
  
  // Timeline & Budget
  budget_range: z.string().min(1, "Please select a budget range"),
  timeline: z.string().min(1, "Please select a timeline"),
  start_date: z.string().optional(),
  
  // Additional Information
  additional_requirements: z.string().optional(),
  files: z.array(z.instanceof(File)).optional(),
  privacy_consent: z.boolean().refine((val) => val === true, "You must agree to the privacy policy"),
  marketing_consent: z.boolean().optional(),
});

// Hook for intake form
export const useIntakeForm = (sessionId?: string) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const form = useForm<IntakeFormData>({
    resolver: zodResolver(intakeFormSchema),
    defaultValues: {
      client_name: "",
      client_email: "",
      company: "",
      phone: "",
      project_type: "",
      project_description: "",
      goals: "",
      target_audience: "",
      tech_stack: [],
      integrations: [],
      platforms: [],
      budget_range: "",
      timeline: "",
      start_date: "",
      additional_requirements: "",
      files: [],
      privacy_consent: false,
      marketing_consent: false,
    },
  });

  const submitIntakeMutation = useMutation({
    mutationFn: (formData: IntakeFormData) => {
      if (!sessionId) {
        throw new Error("Session ID is required");
      }
      return intakeApi.submitIntake(sessionId, formData);
    },
    onSuccess: (response) => {
      if (response.data) {
        toast.success("Intake submitted successfully!");
        queryClient.invalidateQueries({ queryKey: ["intakes"] });
        navigate("/dashboard");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit intake");
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    submitIntakeMutation.mutate(data);
  });

  return {
    form,
    onSubmit,
    isLoading: submitIntakeMutation.isPending,
    error: submitIntakeMutation.error,
  };
};

// Hook for creating intake session
export const useCreateIntakeSession = () => {
  const queryClient = useQueryClient();

  const createSessionMutation = useMutation({
    mutationFn: intakeApi.createSession,
    onSuccess: (response) => {
      if (response.data) {
        queryClient.setQueryData(["intake-session"], response.data);
        toast.success("Intake session started!");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to create intake session");
    },
  });

  return {
    createSession: createSessionMutation.mutate,
    isLoading: createSessionMutation.isPending,
    error: createSessionMutation.error,
  };
};

// Hook for getting intake questions
export const useIntakeQuestions = () => {
  return useQuery({
    queryKey: ["intake-questions"],
    queryFn: async () => {
      const response = await intakeApi.getQuestions();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook for intake session
export const useIntakeSession = (sessionId: string) => {
  return useQuery({
    queryKey: ["intake-session", sessionId],
    queryFn: async () => {
      const response = await intakeApi.getQuestions(); // This would be a get session endpoint
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    enabled: !!sessionId,
  });
};

// Hook for submitting responses
export const useSubmitResponse = (sessionId: string) => {
  const queryClient = useQueryClient();

  const submitResponseMutation = useMutation({
    mutationFn: (response: IntakeResponse) => 
      intakeApi.submitResponse(sessionId, response),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["intake-session", sessionId] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to submit response");
    },
  });

  return {
    submitResponse: submitResponseMutation.mutate,
    isLoading: submitResponseMutation.isPending,
    error: submitResponseMutation.error,
  };
};

// Hook for AI suggestions
export const useAISuggestions = (sessionId: string) => {
  return useQuery({
    queryKey: ["ai-suggestions", sessionId],
    queryFn: async () => {
      const response = await intakeApi.getAISuggestions(sessionId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Hook for qualification score
export const useQualificationScore = (sessionId: string) => {
  return useQuery({
    queryKey: ["qualification-score", sessionId],
    queryFn: async () => {
      const response = await intakeApi.calculateQualificationScore(sessionId);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    enabled: !!sessionId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Hook for getting intakes (for dashboard)
export const useIntakes = (params?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  return useQuery({
    queryKey: ["intakes", params],
    queryFn: async () => {
      const response = await intakeApi.getIntakes(params);
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Hook for intake analytics
export const useIntakeAnalytics = () => {
  return useQuery({
    queryKey: ["intake-analytics"],
    queryFn: async () => {
      const response = await intakeApi.getIntakeAnalytics();
      if (response.error) {
        throw new Error(response.error);
      }
      return response.data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Hook for file upload
export const useFileUpload = (sessionId: string) => {
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: (files: File[]) => intakeApi.uploadFiles(sessionId, files),
    onSuccess: (response) => {
      if (response.data) {
        toast.success("Files uploaded successfully!");
        queryClient.invalidateQueries({ queryKey: ["intake-session", sessionId] });
      }
    },
    onError: (error: Error) => {
      toast.error(error.message || "Failed to upload files");
    },
  });

  return {
    uploadFiles: uploadMutation.mutate,
    isLoading: uploadMutation.isPending,
    error: uploadMutation.error,
  };
};
