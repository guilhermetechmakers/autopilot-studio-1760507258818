import React, { useState } from "react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  User, 
  FileText, 
  CheckCircle, 
  Loader2,
  MessageSquare
} from "lucide-react";
import { BookingCalendar } from "./BookingCalendar";
import { AIIntakeChat } from "./AIIntakeChat";
import type { BookingFormData, BookingSlot, IntakeQuestion, IntakeResponse } from "@/types";

// Validation schema for booking form
const bookingFormSchema = z.object({
  client_name: z.string().min(2, "Name must be at least 2 characters"),
  client_email: z.string().email("Please enter a valid email address"),
  company: z.string().optional(),
  phone: z.string().optional(),
  slot_id: z.string().min(1, "Please select a time slot"),
  timezone: z.string().min(1, "Please select your timezone"),
  project_type: z.string().optional(),
  project_description: z.string().optional(),
  budget_range: z.string().optional(),
  timeline: z.string().optional(),
  additional_notes: z.string().optional(),
  privacy_consent: z.boolean().refine((val) => val === true, "You must agree to the privacy policy"),
  marketing_consent: z.boolean().optional(),
});

interface AIBookingFormProps {
  onSubmit: (data: BookingFormData) => void;
  isLoading?: boolean;
  initialData?: Partial<BookingFormData>;
  slots?: BookingSlot[];
  questions?: IntakeQuestion[];
  onSlotSelect?: (slotId: string) => void;
  selectedSlotId?: string;
  onResponseSubmit?: (response: IntakeResponse) => void;
  responses?: IntakeResponse[];
  currentQuestionIndex?: number;
  qualificationScore?: number;
  aiSuggestions?: string[];
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

const timezones = [
  "UTC",
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Australia/Sydney"
];

export const AIBookingForm: React.FC<AIBookingFormProps> = ({
  onSubmit,
  isLoading = false,
  initialData = {},
  slots = [],
  questions = [],
  onSlotSelect,
  selectedSlotId,
  onResponseSubmit,
  responses = [],
  currentQuestionIndex = 0,
  qualificationScore,
  aiSuggestions = []
}) => {
  const [activeTab, setActiveTab] = useState("booking");

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      client_name: "",
      client_email: "",
      company: "",
      phone: "",
      slot_id: "",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      project_type: "",
      project_description: "",
      budget_range: "",
      timeline: "",
      additional_notes: "",
      privacy_consent: false,
      marketing_consent: false,
      ...initialData
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    onSubmit(data);
  });

  const handleSlotSelect = (slotId: string) => {
    form.setValue("slot_id", slotId);
    onSlotSelect?.(slotId);
  };

  // Mock questions for demonstration
  const mockQuestions: IntakeQuestion[] = [
    {
      id: "1",
      type: "text",
      question: "What's your name?",
      required: true,
      placeholder: "Enter your full name"
    },
    {
      id: "2",
      type: "select",
      question: "What type of project are you looking to build?",
      required: true,
      options: projectTypes
    },
    {
      id: "3",
      type: "textarea",
      question: "Please describe your project in detail. What are you trying to achieve?",
      required: true,
      placeholder: "Describe your project goals, features, and requirements..."
    },
    {
      id: "4",
      type: "multiselect",
      question: "Which platforms do you need support for?",
      required: true,
      options: ["Web", "iOS", "Android", "Desktop", "Cloud", "API"]
    },
    {
      id: "5",
      type: "select",
      question: "What's your budget range?",
      required: true,
      options: budgetRanges
    },
    {
      id: "6",
      type: "select",
      question: "What's your preferred timeline?",
      required: true,
      options: timelines
    }
  ];

  const displayQuestions = questions.length > 0 ? questions : mockQuestions;

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <div className="p-3 rounded-full bg-gradient-to-r from-primary/10 to-primary/20">
            <Calendar className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Book Your AI Intake Session
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Schedule a personalized AI-assisted intake session to discuss your project needs and get instant qualification insights
        </p>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="booking" className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Book Session
          </TabsTrigger>
          <TabsTrigger value="chat" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            AI Chat
          </TabsTrigger>
        </TabsList>

        <TabsContent value="booking" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Calendar */}
            <div className="space-y-6">
              <BookingCalendar
                slots={slots}
                selectedSlotId={selectedSlotId || form.watch("slot_id")}
                onSlotSelect={handleSlotSelect}
                isLoading={isLoading}
                timezone={form.watch("timezone")}
              />
            </div>

            {/* Form */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Contact Information
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

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone *</Label>
                    <Select
                      value={form.watch("timezone")}
                      onValueChange={(value) => form.setValue("timezone", value)}
                      disabled={isLoading}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your timezone" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz} value={tz}>
                            {tz}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.timezone && (
                      <p className="text-sm text-destructive">
                        {form.formState.errors.timezone.message}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Project Details (Optional)
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="project_type">Project Type</Label>
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
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="project_description">Project Description</Label>
                    <Textarea
                      id="project_description"
                      {...form.register("project_description")}
                      placeholder="Briefly describe your project..."
                      className="min-h-[100px]"
                      disabled={isLoading}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="budget_range">Budget Range</Label>
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
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="timeline">Timeline</Label>
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
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="additional_notes">Additional Notes</Label>
                    <Textarea
                      id="additional_notes"
                      {...form.register("additional_notes")}
                      placeholder="Any additional information you'd like to share..."
                      className="min-h-[80px]"
                      disabled={isLoading}
                    />
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
              <Button
                onClick={handleSubmit}
                size="lg"
                disabled={isLoading || !form.watch("slot_id")}
                className="w-full gap-2 hover:scale-105 transition-transform duration-200"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle className="w-4 h-4" />
                )}
                {isLoading ? "Booking..." : "Book AI Intake Session"}
              </Button>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="chat" className="space-y-6">
          <AIIntakeChat
            questions={displayQuestions}
            responses={responses}
            onResponseSubmit={onResponseSubmit || (() => {})}
            isLoading={isLoading}
            currentQuestionIndex={currentQuestionIndex}
            qualificationScore={qualificationScore}
            aiSuggestions={aiSuggestions}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};