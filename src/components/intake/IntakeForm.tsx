import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Upload, FileText, CheckCircle } from "lucide-react";
import type { IntakeFormData } from "@/types";

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

interface IntakeFormProps {
  onSubmit: (data: IntakeFormData) => void;
  isLoading?: boolean;
  initialData?: Partial<IntakeFormData>;
}

const projectTypes = [
  "Web Application",
  "Mobile App",
  "AI/ML Solution",
  "E-commerce Platform",
  "API Development",
  "Data Analytics",
  "Cloud Migration",
  "DevOps Setup",
  "Other"
];

const budgetRanges = [
  "Under $10,000",
  "$10,000 - $25,000",
  "$25,000 - $50,000",
  "$50,000 - $100,000",
  "$100,000 - $250,000",
  "Over $250,000"
];

const timelines = [
  "1-2 weeks",
  "1 month",
  "2-3 months",
  "3-6 months",
  "6-12 months",
  "Over 1 year"
];

const platforms = [
  "Web",
  "iOS",
  "Android",
  "Desktop",
  "Cloud",
  "API"
];

const techStackOptions = [
  "React",
  "Vue.js",
  "Angular",
  "Node.js",
  "Python",
  "Java",
  "C#",
  "PHP",
  "Ruby",
  "Go",
  "Rust",
  "TypeScript",
  "JavaScript",
  "Docker",
  "Kubernetes",
  "AWS",
  "Azure",
  "Google Cloud",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Redis",
  "Other"
];

const integrationOptions = [
  "Payment Processing",
  "Email Services",
  "CRM Integration",
  "Analytics",
  "Social Media",
  "Third-party APIs",
  "Database Integration",
  "Cloud Storage",
  "Authentication",
  "Other"
];

export const IntakeForm: React.FC<IntakeFormProps> = ({
  onSubmit,
  isLoading = false,
  initialData = {}
}) => {
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
      ...initialData
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

  const [selectedTechStack, setSelectedTechStack] = React.useState<string[]>([]);
  const [selectedIntegrations, setSelectedIntegrations] = React.useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = React.useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = React.useState<File[]>([]);

  const handleTechStackChange = (tech: string, checked: boolean) => {
    const newTechStack = checked 
      ? [...selectedTechStack, tech]
      : selectedTechStack.filter(t => t !== tech);
    setSelectedTechStack(newTechStack);
    form.setValue("tech_stack", newTechStack);
  };

  const handleIntegrationChange = (integration: string, checked: boolean) => {
    const newIntegrations = checked 
      ? [...selectedIntegrations, integration]
      : selectedIntegrations.filter(i => i !== integration);
    setSelectedIntegrations(newIntegrations);
    form.setValue("integrations", newIntegrations);
  };

  const handlePlatformChange = (platform: string, checked: boolean) => {
    const newPlatforms = checked 
      ? [...selectedPlatforms, platform]
      : selectedPlatforms.filter(p => p !== platform);
    setSelectedPlatforms(newPlatforms);
    form.setValue("platforms", newPlatforms);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const newFiles = [...uploadedFiles, ...files];
    setUploadedFiles(newFiles);
    form.setValue("files", newFiles);
  };

  const removeFile = (index: number) => {
    const newFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(newFiles);
    form.setValue("files", newFiles);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Basic Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client_name">Full Name *</Label>
              <Input
                id="client_name"
                {...form.register("client_name")}
                placeholder="Enter your full name"
                disabled={isLoading}
              />
              {form.formState.errors.client_name && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.client_name.message}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="client_email">Email Address *</Label>
              <Input
                id="client_email"
                type="email"
                {...form.register("client_email")}
                placeholder="Enter your email address"
                disabled={isLoading}
              />
              {form.formState.errors.client_email && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.client_email.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="company">Company (Optional)</Label>
              <Input
                id="company"
                {...form.register("company")}
                placeholder="Enter your company name"
                disabled={isLoading}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number (Optional)</Label>
              <Input
                id="phone"
                {...form.register("phone")}
                placeholder="Enter your phone number"
                disabled={isLoading}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Details */}
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="project_type">Project Type *</Label>
            <Select
              value={form.watch("project_type")}
              onValueChange={(value) => form.setValue("project_type", value)}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select project type" />
              </SelectTrigger>
              <SelectContent>
                {projectTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.project_type && (
              <p className="text-sm text-destructive">
                {form.formState.errors.project_type.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="project_description">Project Description *</Label>
            <Textarea
              id="project_description"
              {...form.register("project_description")}
              placeholder="Describe your project in detail..."
              className="min-h-[120px]"
              disabled={isLoading}
            />
            {form.formState.errors.project_description && (
              <p className="text-sm text-destructive">
                {form.formState.errors.project_description.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="goals">Project Goals *</Label>
            <Textarea
              id="goals"
              {...form.register("goals")}
              placeholder="What are you trying to achieve with this project?"
              className="min-h-[100px]"
              disabled={isLoading}
            />
            {form.formState.errors.goals && (
              <p className="text-sm text-destructive">
                {form.formState.errors.goals.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="target_audience">Target Audience (Optional)</Label>
            <Input
              id="target_audience"
              {...form.register("target_audience")}
              placeholder="Who will use this product?"
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Technical Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>Technical Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Platforms *</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {platforms.map((platform) => (
                <div key={platform} className="flex items-center space-x-2">
                  <Checkbox
                    id={`platform-${platform}`}
                    checked={selectedPlatforms.includes(platform)}
                    onCheckedChange={(checked) => 
                      handlePlatformChange(platform, checked as boolean)
                    }
                    disabled={isLoading}
                  />
                  <Label htmlFor={`platform-${platform}`} className="text-sm">
                    {platform}
                  </Label>
                </div>
              ))}
            </div>
            {form.formState.errors.platforms && (
              <p className="text-sm text-destructive">
                {form.formState.errors.platforms.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Preferred Tech Stack (Optional)</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {techStackOptions.map((tech) => (
                <div key={tech} className="flex items-center space-x-2">
                  <Checkbox
                    id={`tech-${tech}`}
                    checked={selectedTechStack.includes(tech)}
                    onCheckedChange={(checked) => 
                      handleTechStackChange(tech, checked as boolean)
                    }
                    disabled={isLoading}
                  />
                  <Label htmlFor={`tech-${tech}`} className="text-sm">
                    {tech}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Required Integrations (Optional)</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {integrationOptions.map((integration) => (
                <div key={integration} className="flex items-center space-x-2">
                  <Checkbox
                    id={`integration-${integration}`}
                    checked={selectedIntegrations.includes(integration)}
                    onCheckedChange={(checked) => 
                      handleIntegrationChange(integration, checked as boolean)
                    }
                    disabled={isLoading}
                  />
                  <Label htmlFor={`integration-${integration}`} className="text-sm">
                    {integration}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline & Budget */}
      <Card>
        <CardHeader>
          <CardTitle>Timeline & Budget</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="budget_range">Budget Range *</Label>
              <Select
                value={form.watch("budget_range")}
                onValueChange={(value) => form.setValue("budget_range", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  {budgetRanges.map((range) => (
                    <SelectItem key={range} value={range}>
                      {range}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.budget_range && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.budget_range.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="timeline">Timeline *</Label>
              <Select
                value={form.watch("timeline")}
                onValueChange={(value) => form.setValue("timeline", value)}
                disabled={isLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
                <SelectContent>
                  {timelines.map((timeline) => (
                    <SelectItem key={timeline} value={timeline}>
                      {timeline}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.timeline && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.timeline.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="start_date">Preferred Start Date (Optional)</Label>
            <Input
              id="start_date"
              type="date"
              {...form.register("start_date")}
              disabled={isLoading}
            />
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="additional_requirements">Additional Requirements</Label>
            <Textarea
              id="additional_requirements"
              {...form.register("additional_requirements")}
              placeholder="Any other requirements or specifications..."
              className="min-h-[100px]"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label>Upload Files (Optional)</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="flex flex-col items-center gap-2">
                <Upload className="w-8 h-8 text-muted-foreground" />
                <div className="text-sm text-muted-foreground">
                  <label htmlFor="file-upload" className="cursor-pointer">
                    Click to upload files or drag and drop
                  </label>
                  <input
                    id="file-upload"
                    type="file"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                    disabled={isLoading}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  PDF, DOC, images, or other relevant files
                </p>
              </div>
            </div>
            
            {uploadedFiles.length > 0 && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Uploaded Files:</p>
                <div className="space-y-1">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <span className="text-sm">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={isLoading}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Consent */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <Checkbox
                id="privacy_consent"
                {...form.register("privacy_consent")}
                disabled={isLoading}
              />
              <div className="space-y-1">
                <Label htmlFor="privacy_consent" className="text-sm">
                  I agree to the privacy policy and terms of service *
                </Label>
                {form.formState.errors.privacy_consent && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.privacy_consent.message}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="marketing_consent"
                {...form.register("marketing_consent")}
                disabled={isLoading}
              />
              <Label htmlFor="marketing_consent" className="text-sm">
                I would like to receive updates about new features and services (Optional)
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end">
        <Button
          type="submit"
          size="lg"
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <CheckCircle className="w-4 h-4" />
          )}
          {isLoading ? "Submitting..." : "Submit Intake"}
        </Button>
      </div>
    </form>
  );
};
