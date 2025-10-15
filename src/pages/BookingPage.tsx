import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Clock, 
  Loader2,
  Bot,
  Sparkles
} from "lucide-react";
import { AIBookingForm } from "@/components/intake/AIBookingForm";
import { 
  useBookingSlots, 
  useBookingForm,
  useIntakeQuestions,
  useSubmitResponse,
  useAISuggestions,
  useQualificationScore
} from "@/hooks/useIntake";
import type { BookingSlot, IntakeQuestion, IntakeResponse } from "@/types";

export default function BookingPage() {
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [responses, setResponses] = useState<IntakeResponse[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Hooks
  const { data: slots = [], isLoading: slotsLoading } = useBookingSlots({
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
  });
  
  const { data: questions = [], isLoading: questionsLoading } = useIntakeQuestions();
  const { form, onSubmit, isLoading: formLoading } = useBookingForm();
  const { submitResponse } = useSubmitResponse("");
  const { data: aiSuggestions } = useAISuggestions("");
  const { data: qualificationScore } = useQualificationScore("");

  // Mock slots for demonstration
  const mockSlots: BookingSlot[] = [
    {
      id: "1",
      start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
      is_available: true,
      timezone: "UTC"
    },
    {
      id: "2",
      start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
      is_available: true,
      timezone: "UTC"
    },
    {
      id: "3",
      start_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
      is_available: false,
      timezone: "UTC"
    },
    {
      id: "4",
      start_time: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
      is_available: true,
      timezone: "UTC"
    },
    {
      id: "5",
      start_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      end_time: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString(),
      is_available: true,
      timezone: "UTC"
    }
  ];

  const displaySlots = slots.length > 0 ? slots : mockSlots;

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

  const handleSlotSelect = (slotId: string) => {
    setSelectedSlotId(slotId);
    form.setValue("slot_id", slotId);
  };

  const handleResponseSubmit = (response: IntakeResponse) => {
    setResponses(prev => [...prev, response]);
    submitResponse(response, {
      onSuccess: () => {
        if (currentQuestionIndex < displayQuestions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        }
      }
    });
  };

  if (slotsLoading || questionsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading booking options...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <AIBookingForm
          onSubmit={() => onSubmit()}
          isLoading={formLoading}
          slots={displaySlots}
          questions={displayQuestions}
          onSlotSelect={handleSlotSelect}
          selectedSlotId={selectedSlotId}
          onResponseSubmit={handleResponseSubmit}
          responses={responses}
          currentQuestionIndex={currentQuestionIndex}
          qualificationScore={qualificationScore?.score}
          aiSuggestions={aiSuggestions?.suggestions || []}
        />

        {/* Features Section */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="text-center hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary/10 to-primary/20 flex items-center justify-center">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">AI-Powered Intake</h3>
              <p className="text-sm text-muted-foreground">
                Our AI assistant asks intelligent follow-up questions based on your responses
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary/10 to-primary/20 flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Smart Qualification</h3>
              <p className="text-sm text-muted-foreground">
                Get instant qualification scores and personalized recommendations
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow duration-200">
            <CardContent className="p-6">
              <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-gradient-to-r from-primary/10 to-primary/20 flex items-center justify-center">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Flexible Scheduling</h3>
              <p className="text-sm text-muted-foreground">
                Choose from available time slots that work with your schedule
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}