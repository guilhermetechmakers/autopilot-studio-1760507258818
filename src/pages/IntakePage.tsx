import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Bot, 
  FileText, 
  Sparkles, 
  CheckCircle,
  Clock,
  Loader2,
  MessageSquare,
  BarChart3
} from "lucide-react";
import { IntakeConversation } from "@/components/intake/IntakeConversation";
import { IntakeProgress } from "@/components/intake/IntakeProgress";
import { IntakeForm } from "@/components/intake/IntakeForm";
import { 
  useIntakeQuestions, 
  useCreateIntakeSession, 
  useSubmitResponse,
  useAISuggestions,
  useQualificationScore,
  useIntakeForm
} from "@/hooks/useIntake";
import { intakeApi } from "@/api/intake";
import type { IntakeQuestion, IntakeResponse, IntakeFormData } from "@/types";

export default function IntakePage() {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [responses, setResponses] = useState<IntakeResponse[]>([]);
  const [isConversationMode, setIsConversationMode] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);

  // Hooks
  const { data: questions = [], isLoading: questionsLoading } = useIntakeQuestions();
  const { createSession, isLoading: sessionLoading } = useCreateIntakeSession();
  const { submitResponse, isLoading: responseLoading } = useSubmitResponse(sessionId || "");
  const { data: aiSuggestions } = useAISuggestions(sessionId || "");
  const { data: qualificationScore } = useQualificationScore(sessionId || "");
  const { isLoading: formLoading } = useIntakeForm(sessionId || undefined);

  // Initialize session
  useEffect(() => {
    if (!sessionId && !sessionLoading) {
      createSession(undefined, {
        onSuccess: (response) => {
          if (response.data) {
            setSessionId(response.data.id);
          }
        }
      });
    }
  }, [sessionId, sessionLoading, createSession]);

  // Handle response submission
  const handleResponseSubmit = (response: IntakeResponse) => {
    if (!sessionId) return;

    setResponses(prev => [...prev, response]);
    submitResponse(response, {
      onSuccess: () => {
        // Move to next question or complete
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        } else {
          setIsCompleted(true);
        }
      }
    });
  };

  // Handle form submission
  const handleFormSubmit = (data: IntakeFormData) => {
    // The onSubmit from useIntakeForm expects a form event, but we have the data
    // We need to call the mutation directly
    if (sessionId) {
      intakeApi.submitIntake(sessionId, data).then(() => {
        // Handle success
      }).catch((error) => {
        console.error('Form submission error:', error);
      });
    }
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
      options: [
        "Web Application",
        "Mobile App",
        "AI/ML Solution",
        "E-commerce Platform",
        "API Development",
        "Other"
      ]
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
      options: [
        "Under $10,000",
        "$10,000 - $25,000",
        "$25,000 - $50,000",
        "$50,000 - $100,000",
        "$100,000 - $250,000",
        "Over $250,000"
      ]
    },
    {
      id: "6",
      type: "select",
      question: "What's your preferred timeline?",
      required: true,
      options: [
        "1-2 weeks",
        "1 month",
        "2-3 months",
        "3-6 months",
        "6-12 months",
        "Over 1 year"
      ]
    }
  ];

  const displayQuestions = questions.length > 0 ? questions : mockQuestions;
  const currentQuestion = displayQuestions[currentQuestionIndex];
  const completedSteps = responses.length;
  const totalSteps = displayQuestions.length;

  if (questionsLoading || sessionLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Setting up your intake session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-primary/10">
              <Bot className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-4xl font-bold gradient-text">
              AI-Assisted Intake
            </h1>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Let our AI assistant guide you through a personalized intake process to understand your project needs
          </p>
        </div>

        {/* Progress */}
        {!isCompleted && (
          <div className="mb-8">
            <IntakeProgress
              currentStep={currentQuestionIndex + 1}
              totalSteps={totalSteps}
              completedSteps={completedSteps}
              currentStepName={currentQuestion?.question || "Getting started..."}
              qualificationScore={qualificationScore?.score}
            />
          </div>
        )}

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          <Tabs value={isConversationMode ? "conversation" : "form"} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger 
                value="conversation" 
                onClick={() => setIsConversationMode(true)}
                className="flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                AI Conversation
              </TabsTrigger>
              <TabsTrigger 
                value="form" 
                onClick={() => setIsConversationMode(false)}
                className="flex items-center gap-2"
              >
                <FileText className="w-4 h-4" />
                Traditional Form
              </TabsTrigger>
            </TabsList>

            <TabsContent value="conversation" className="space-y-6">
              {!isCompleted ? (
                <IntakeConversation
                  questions={displayQuestions}
                  responses={responses}
                  onResponseSubmit={handleResponseSubmit}
                  isLoading={responseLoading}
                  currentQuestionIndex={currentQuestionIndex}
                  qualificationScore={qualificationScore?.score}
                  aiSuggestions={aiSuggestions?.suggestions || []}
                />
              ) : (
                <Card className="w-full">
                  <CardContent className="p-8 text-center">
                    <div className="space-y-4">
                      <div className="w-16 h-16 mx-auto rounded-full bg-green-100 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <h2 className="text-2xl font-bold">Intake Complete!</h2>
                      <p className="text-muted-foreground">
                        Thank you for providing your project details. Our team will review your information and get back to you within 24 hours.
                      </p>
                      {qualificationScore && (
                        <div className="mt-6 p-4 bg-muted rounded-lg">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <BarChart3 className="w-5 h-5 text-primary" />
                            <span className="font-semibold">Qualification Score</span>
                          </div>
                          <div className="text-3xl font-bold text-primary">
                            {qualificationScore.score}%
                          </div>
                        </div>
                      )}
                      <div className="flex justify-center gap-4 mt-6">
                        <Button onClick={() => window.location.href = "/dashboard"}>
                          Go to Dashboard
                        </Button>
                        <Button variant="outline" onClick={() => window.location.href = "/"}>
                          Back to Home
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="form" className="space-y-6">
              <IntakeForm
                onSubmit={handleFormSubmit}
                isLoading={formLoading}
              />
            </TabsContent>
          </Tabs>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI-Powered</h3>
              <p className="text-sm text-muted-foreground">
                Our AI assistant asks intelligent follow-up questions based on your responses
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Qualification</h3>
              <p className="text-sm text-muted-foreground">
                Get instant qualification scores and personalized recommendations
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Quick & Easy</h3>
              <p className="text-sm text-muted-foreground">
                Complete the intake process in just a few minutes
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
