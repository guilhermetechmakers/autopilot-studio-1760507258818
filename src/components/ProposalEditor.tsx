import React, { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Save, 
  Eye, 
  ArrowLeft, 
  Wand2, 
  FileText, 
  Loader2,
  Sparkles
} from "lucide-react";
import { toast } from "sonner";

import { proposalsApi, templatesApi } from "@/api/proposals";
import type { Proposal, SoWTemplate } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

const proposalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  content: z.string().min(1, "Content is required"),
  value: z.number().min(0, "Value must be positive"),
  client_id: z.string().min(1, "Client ID is required"),
  project_id: z.string().optional(),
  template_id: z.string().optional(),
});

type ProposalFormData = z.infer<typeof proposalSchema>;

interface ProposalEditorProps {
  proposal?: Proposal;
  onSave?: (proposal: Proposal) => void;
  onCancel?: () => void;
}

const ProposalEditor: React.FC<ProposalEditorProps> = ({
  proposal,
  onSave,
  onCancel,
}) => {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState<SoWTemplate | null>(null);
  const queryClient = useQueryClient();

  const isEditing = !!proposal;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
  } = useForm<ProposalFormData>({
    resolver: zodResolver(proposalSchema),
    defaultValues: {
      title: proposal?.title || "",
      content: proposal?.content || "",
      value: proposal?.value || 0,
      client_id: proposal?.client_id || "",
      project_id: proposal?.project_id || "",
      template_id: proposal?.template_id || "",
    },
  });

  // Fetch templates
  const { data: templates, isLoading: templatesLoading } = useQuery({
    queryKey: ["templates"],
    queryFn: () => templatesApi.getTemplates({ is_active: true }),
  });

  // Create proposal mutation
  const createProposalMutation = useMutation({
    mutationFn: proposalsApi.createProposal,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      toast.success("Proposal created successfully");
      onSave?.(response.data!);
    },
    onError: (error) => {
      toast.error("Failed to create proposal");
      console.error("Create error:", error);
    },
  });

  // Update proposal mutation
  const updateProposalMutation = useMutation({
    mutationFn: proposalsApi.updateProposal,
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["proposals"] });
      toast.success("Proposal updated successfully");
      onSave?.(response.data!);
    },
    onError: (error) => {
      toast.error("Failed to update proposal");
      console.error("Update error:", error);
    },
  });

  // Generate AI proposal mutation
  const generateAIMutation = useMutation({
    mutationFn: proposalsApi.generateAIProposal,
    onSuccess: (response) => {
      const generatedProposal = response.data!;
      setValue("title", generatedProposal.title);
      setValue("content", generatedProposal.content);
      setValue("value", generatedProposal.value);
      setValue("client_id", generatedProposal.client_id);
      setShowAIGenerator(false);
      toast.success("AI proposal generated successfully");
    },
    onError: (error) => {
      toast.error("Failed to generate AI proposal");
      console.error("AI generation error:", error);
    },
  });

  // Generate from template mutation
  const generateFromTemplateMutation = useMutation({
    mutationFn: ({ templateId, variables }: { templateId: string; variables: Record<string, string> }) =>
      templatesApi.generateFromTemplate(templateId, variables),
    onSuccess: (response) => {
      const generatedProposal = response.data!;
      setValue("title", generatedProposal.title);
      setValue("content", generatedProposal.content);
      setValue("value", generatedProposal.value);
      setValue("template_id", selectedTemplate?.id || "");
      toast.success("Proposal generated from template");
    },
    onError: (error) => {
      toast.error("Failed to generate from template");
      console.error("Template generation error:", error);
    },
  });

  const onSubmit = async (data: ProposalFormData) => {
    if (isEditing) {
      updateProposalMutation.mutate({
        id: proposal.id,
        ...data,
      });
    } else {
      createProposalMutation.mutate(data);
    }
  };

  const handleAIGenerate = () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a prompt for AI generation");
      return;
    }

    generateAIMutation.mutate({
      client_id: watch("client_id"),
      requirements: aiPrompt,
      budget_range: watch("value") ? `$${watch("value")}` : undefined,
    });
  };

  const handleTemplateGenerate = () => {
    if (!selectedTemplate) {
      toast.error("Please select a template");
      return;
    }

    // Extract variables from template content
    const variables: Record<string, string> = {
      client_name: "Client Name",
      project_title: watch("title") || "Project Title",
      project_value: watch("value")?.toString() || "0",
      project_timeline: "4-6 weeks",
    };

    generateFromTemplateMutation.mutate({
      templateId: selectedTemplate.id,
      variables,
    });
  };


  const watchedContent = watch("content");

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onCancel} className="p-2">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h2 className="text-2xl font-bold gradient-text">
              {isEditing ? "Edit Proposal" : "Create New Proposal"}
            </h2>
            <p className="text-muted-foreground">
              {isEditing ? "Update your proposal details" : "Build a professional proposal for your client"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {isPreviewMode ? "Edit" : "Preview"}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowAIGenerator(true)}
          >
            <Wand2 className="h-4 w-4 mr-2" />
            AI Generate
          </Button>
        </div>
      </div>

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Proposal Content
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isPreviewMode ? (
                <div className="prose max-w-none">
                  <div className="bg-muted/50 p-6 rounded-lg border">
                    <h1 className="text-3xl font-bold mb-4">{watch("title")}</h1>
                    <div 
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ 
                        __html: watchedContent?.replace(/\n/g, '<br/>') || "" 
                      }}
                    />
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <Label htmlFor="title">Proposal Title</Label>
                    <Input
                      id="title"
                      {...register("title")}
                      placeholder="Enter proposal title..."
                      className="mt-1"
                    />
                    {errors.title && (
                      <p className="text-sm text-destructive mt-1">{errors.title.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="content">Proposal Content</Label>
                    <Textarea
                      id="content"
                      {...register("content")}
                      placeholder="Enter your proposal content..."
                      className="mt-1 min-h-[400px]"
                    />
                    {errors.content && (
                      <p className="text-sm text-destructive mt-1">{errors.content.message}</p>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onCancel}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isSubmitting} className="btn-primary">
                      {isSubmitting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      {isEditing ? "Update Proposal" : "Create Proposal"}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details" className="space-y-6">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Proposal Details</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <Label htmlFor="client_id">Client ID</Label>
                    <Input
                      id="client_id"
                      {...register("client_id")}
                      placeholder="Enter client ID..."
                      className="mt-1"
                    />
                    {errors.client_id && (
                      <p className="text-sm text-destructive mt-1">{errors.client_id.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="project_id">Project ID (Optional)</Label>
                    <Input
                      id="project_id"
                      {...register("project_id")}
                      placeholder="Enter project ID..."
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="value">Proposal Value ($)</Label>
                    <Input
                      id="value"
                      type="number"
                      {...register("value", { valueAsNumber: true })}
                      placeholder="0"
                      className="mt-1"
                    />
                    {errors.value && (
                      <p className="text-sm text-destructive mt-1">{errors.value.message}</p>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="template_id">Template ID (Optional)</Label>
                    <Input
                      id="template_id"
                      {...register("template_id")}
                      placeholder="Enter template ID..."
                      className="mt-1"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting} className="btn-primary">
                    {isSubmitting ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4 mr-2" />
                    )}
                    {isEditing ? "Update Proposal" : "Create Proposal"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                SoW Templates
              </CardTitle>
            </CardHeader>
            <CardContent>
              {templatesLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <Skeleton key={i} className="h-20 w-full" />
                  ))}
                </div>
              ) : !templates?.data?.length ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Templates Available</h3>
                  <p className="text-muted-foreground">
                    No SoW templates are currently available.
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {templates.data.map((template) => (
                    <div
                      key={template.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                        selectedTemplate?.id === template.id
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                      onClick={() => setSelectedTemplate(template)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold">{template.name}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {template.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{template.category}</Badge>
                            {template.variables.length > 0 && (
                              <Badge variant="secondary">
                                {template.variables.length} variables
                              </Badge>
                            )}
                          </div>
                        </div>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTemplate(template);
                            handleTemplateGenerate();
                          }}
                          disabled={generateFromTemplateMutation.isPending}
                        >
                          {generateFromTemplateMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Sparkles className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Generator Dialog */}
      <Dialog open={showAIGenerator} onOpenChange={setShowAIGenerator}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5" />
              AI Proposal Generator
            </DialogTitle>
            <DialogDescription>
              Describe your project requirements and let AI generate a professional proposal for you.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="ai-prompt">Project Requirements</Label>
              <Textarea
                id="ai-prompt"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="Describe the project requirements, goals, timeline, and any specific details..."
                className="mt-1 min-h-[200px]"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              <p>AI will generate a proposal based on your requirements including:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Professional project overview</li>
                <li>Detailed scope of work</li>
                <li>Timeline and milestones</li>
                <li>Pricing and payment terms</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAIGenerator(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAIGenerate}
              disabled={generateAIMutation.isPending || !aiPrompt.trim()}
              className="btn-primary"
            >
              {generateAIMutation.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Generate Proposal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProposalEditor;
