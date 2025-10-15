import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Copy,
  Search,
  Filter,
  MoreHorizontal,
  Sparkles,
  CheckCircle,
  Clock,
  AlertCircle
} from "lucide-react";
import { toast } from "sonner";

import { templatesApi } from "@/api/proposals";
import type { SoWTemplate, CreateSoWTemplateInput } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

interface SoWTemplatesProps {
  onSelectTemplate?: (template: SoWTemplate) => void;
  onCreateNew?: () => void;
}

const categoryConfig = {
  web_development: { label: "Web Development", color: "bg-blue-100 text-blue-800" },
  mobile_app: { label: "Mobile App", color: "bg-green-100 text-green-800" },
  ai_ml: { label: "AI/ML", color: "bg-purple-100 text-purple-800" },
  consulting: { label: "Consulting", color: "bg-orange-100 text-orange-800" },
  custom: { label: "Custom", color: "bg-gray-100 text-gray-800" },
};

const SoWTemplates: React.FC<SoWTemplatesProps> = ({ 
  onSelectTemplate
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showPreviewDialog, setShowPreviewDialog] = useState(false);
  const [previewTemplate, setPreviewTemplate] = useState<SoWTemplate | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<SoWTemplate | null>(null);
  const queryClient = useQueryClient();

  // Fetch templates
  const { data: templatesData, isLoading, error } = useQuery({
    queryKey: ["templates", { search: searchTerm, category: categoryFilter }],
    queryFn: () => templatesApi.getTemplates({
      category: categoryFilter !== "all" ? categoryFilter : undefined,
      is_active: true,
    }),
  });

  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: templatesApi.createTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Template created successfully");
      setShowCreateDialog(false);
    },
    onError: (error) => {
      toast.error("Failed to create template");
      console.error("Create error:", error);
    },
  });

  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateSoWTemplateInput> }) =>
      templatesApi.updateTemplate(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Template updated successfully");
      setEditingTemplate(null);
    },
    onError: (error) => {
      toast.error("Failed to update template");
      console.error("Update error:", error);
    },
  });

  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: templatesApi.deleteTemplate,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["templates"] });
      toast.success("Template deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete template");
      console.error("Delete error:", error);
    },
  });

  const handleCreateTemplate = (data: CreateSoWTemplateInput) => {
    createTemplateMutation.mutate(data);
  };

  const handleUpdateTemplate = (data: Partial<CreateSoWTemplateInput>) => {
    if (editingTemplate) {
      updateTemplateMutation.mutate({ id: editingTemplate.id, data });
    }
  };

  const handleDeleteTemplate = (template: SoWTemplate) => {
    if (window.confirm(`Are you sure you want to delete "${template.name}"?`)) {
      deleteTemplateMutation.mutate(template.id);
    }
  };

  const handlePreviewTemplate = (template: SoWTemplate) => {
    setPreviewTemplate(template);
    setShowPreviewDialog(true);
  };

  const handleEditTemplate = (template: SoWTemplate) => {
    setEditingTemplate(template);
    setShowCreateDialog(true);
  };

  const handleCopyTemplate = (template: SoWTemplate) => {
    navigator.clipboard.writeText(template.content);
    toast.success("Template content copied to clipboard");
  };

  const getCategoryConfig = (category: string) => {
    return categoryConfig[category as keyof typeof categoryConfig] || categoryConfig.custom;
  };

  if (error) {
    return (
      <Card className="animate-fade-in">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Templates</h3>
            <p className="text-muted-foreground mb-4">
              There was an error loading the templates. Please try again.
            </p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold gradient-text">SoW Templates</h2>
          <p className="text-muted-foreground">
            Manage your statement of work templates
          </p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="btn-primary">
          <Plus className="h-4 w-4 mr-2" />
          New Template
        </Button>
      </div>

      {/* Filters */}
      <Card className="card-hover">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 border border-input rounded-md bg-background text-sm"
              >
                <option value="all">All Categories</option>
                <option value="web_development">Web Development</option>
                <option value="mobile_app">Mobile App</option>
                <option value="ai_ml">AI/ML</option>
                <option value="consulting">Consulting</option>
                <option value="custom">Custom</option>
              </select>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {isLoading ? (
          [...Array(6)].map((_, i) => (
            <Card key={i} className="card-hover">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-full mb-4" />
                <div className="flex gap-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardContent>
            </Card>
          ))
        ) : !templatesData?.data?.length ? (
          <div className="col-span-full">
            <Card className="card-hover">
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Templates Found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchTerm || categoryFilter !== "all"
                      ? "No templates match your current filters."
                      : "Get started by creating your first template."}
                  </p>
                  {!searchTerm && categoryFilter === "all" && (
                    <Button onClick={() => setShowCreateDialog(true)} className="btn-primary">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Template
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          templatesData.data.map((template) => {
            const categoryInfo = getCategoryConfig(template.category);
            
            return (
              <Card key={template.id} className="card-hover group">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {template.description}
                      </p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handlePreviewTemplate(template)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSelectTemplate?.(template)}>
                          <Sparkles className="h-4 w-4 mr-2" />
                          Use Template
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleCopyTemplate(template)}>
                          <Copy className="h-4 w-4 mr-2" />
                          Copy Content
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleDeleteTemplate(template)}
                          className="text-destructive"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge className={categoryInfo.color}>
                      {categoryInfo.label}
                    </Badge>
                    {template.variables.length > 0 && (
                      <Badge variant="outline">
                        {template.variables.length} variables
                      </Badge>
                    )}
                    {template.is_active ? (
                      <Badge variant="default" className="bg-green-100 text-green-800">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary">
                        <Clock className="h-3 w-3 mr-1" />
                        Inactive
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Created {new Date(template.created_at).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Create/Edit Template Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "Edit Template" : "Create New Template"}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate 
                ? "Update your template details and content."
                : "Create a new statement of work template for your proposals."
              }
            </DialogDescription>
          </DialogHeader>
          <TemplateForm
            template={editingTemplate}
            onSubmit={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
            onCancel={() => {
              setShowCreateDialog(false);
              setEditingTemplate(null);
            }}
            isLoading={createTemplateMutation.isPending || updateTemplateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Preview Template Dialog */}
      <Dialog open={showPreviewDialog} onOpenChange={setShowPreviewDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Template Preview
            </DialogTitle>
            <DialogDescription>
              Preview the template content and structure.
            </DialogDescription>
          </DialogHeader>
          {previewTemplate && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={getCategoryConfig(previewTemplate.category).color}>
                  {getCategoryConfig(previewTemplate.category).label}
                </Badge>
                {previewTemplate.variables.length > 0 && (
                  <Badge variant="outline">
                    {previewTemplate.variables.length} variables
                  </Badge>
                )}
              </div>
              <div className="prose max-w-none">
                <div className="bg-muted/50 p-6 rounded-lg border">
                  <h1 className="text-2xl font-bold mb-4">{previewTemplate.name}</h1>
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: previewTemplate.content.replace(/\n/g, '<br/>') 
                    }}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPreviewDialog(false)}>
              Close
            </Button>
            <Button 
              onClick={() => {
                if (previewTemplate) {
                  onSelectTemplate?.(previewTemplate);
                  setShowPreviewDialog(false);
                }
              }}
              className="btn-primary"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              Use Template
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Template Form Component
interface TemplateFormProps {
  template?: SoWTemplate | null;
  onSubmit: (data: CreateSoWTemplateInput) => void;
  onCancel: () => void;
  isLoading: boolean;
}

const TemplateForm: React.FC<TemplateFormProps> = ({
  template,
  onSubmit,
  onCancel,
  isLoading,
}) => {
  const [formData, setFormData] = useState({
    name: template?.name || "",
    description: template?.description || "",
    content: template?.content || "",
    category: (template?.category || "custom") as "web_development" | "mobile_app" | "ai_ml" | "consulting" | "custom",
    variables: template?.variables || [],
  });

  const [newVariable, setNewVariable] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.content.trim()) {
      toast.error("Name and content are required");
      return;
    }
    onSubmit(formData);
  };

  const addVariable = () => {
    if (newVariable.trim() && !formData.variables.includes(newVariable.trim())) {
      setFormData(prev => ({
        ...prev,
        variables: [...prev.variables, newVariable.trim()]
      }));
      setNewVariable("");
    }
  };

  const removeVariable = (variable: string) => {
    setFormData(prev => ({
      ...prev,
      variables: prev.variables.filter(v => v !== variable)
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label htmlFor="name">Template Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Enter template name..."
            className="mt-1"
            required
          />
        </div>
        <div>
          <Label htmlFor="category">Category</Label>
          <select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as "web_development" | "mobile_app" | "ai_ml" | "consulting" | "custom" }))}
            className="mt-1 w-full px-3 py-2 border border-input rounded-md bg-background text-sm"
          >
            <option value="web_development">Web Development</option>
            <option value="mobile_app">Mobile App</option>
            <option value="ai_ml">AI/ML</option>
            <option value="consulting">Consulting</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Enter template description..."
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="content">Template Content</Label>
        <Textarea
          id="content"
          value={formData.content}
          onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
          placeholder="Enter template content with variables like {{client_name}}, {{project_title}}, etc..."
          className="mt-1 min-h-[300px]"
          required
        />
        <p className="text-xs text-muted-foreground mt-1">
          Use variables like {"{{client_name}}"}, {"{{project_title}}"}, {"{{project_value}}"} in your content.
        </p>
      </div>

      <div>
        <Label>Variables</Label>
        <div className="mt-2 space-y-2">
          <div className="flex gap-2">
            <Input
              value={newVariable}
              onChange={(e) => setNewVariable(e.target.value)}
              placeholder="Add variable name..."
              className="flex-1"
            />
            <Button type="button" onClick={addVariable} size="sm">
              Add
            </Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.variables.map((variable) => (
              <Badge key={variable} variant="outline" className="flex items-center gap-1">
                {variable}
                <button
                  type="button"
                  onClick={() => removeVariable(variable)}
                  className="ml-1 hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="btn-primary">
          {isLoading ? (
            <Clock className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <FileText className="h-4 w-4 mr-2" />
          )}
          {template ? "Update Template" : "Create Template"}
        </Button>
      </DialogFooter>
    </form>
  );
};

export default SoWTemplates;
