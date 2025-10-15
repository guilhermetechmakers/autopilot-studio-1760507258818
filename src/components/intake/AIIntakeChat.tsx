import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Bot, 
  User, 
  Send, 
  Sparkles,
  ArrowRight,
  Loader2,
  Brain
} from "lucide-react";
import type { IntakeQuestion, IntakeResponse } from "@/types";

interface AIIntakeChatProps {
  questions: IntakeQuestion[];
  responses: IntakeResponse[];
  onResponseSubmit: (response: IntakeResponse) => void;
  isLoading?: boolean;
  currentQuestionIndex: number;
  qualificationScore?: number;
  aiSuggestions?: string[];
}

interface MessageProps {
  type: "ai" | "user";
  content: string;
  timestamp: string;
  isTyping?: boolean;
  isSystem?: boolean;
}

const Message: React.FC<MessageProps> = ({ type, content, timestamp, isTyping = false, isSystem = false }) => {
  return (
    <div className={cn(
      "flex gap-3 p-4 rounded-lg transition-all duration-200",
      type === "ai" ? "bg-gradient-to-r from-primary/5 to-primary/10" : "bg-muted/30",
      isSystem && "bg-blue-50 border border-blue-200"
    )}>
      <div className={cn(
        "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
        type === "ai" ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground" : "bg-secondary text-secondary-foreground",
        isSystem && "bg-blue-500 text-white"
      )}>
        {type === "ai" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-medium">
            {isSystem ? "System" : type === "ai" ? "AI Assistant" : "You"}
          </span>
          <span className="text-xs text-muted-foreground">{timestamp}</span>
        </div>
        <div className="text-sm">
          {isTyping ? (
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>AI is thinking...</span>
            </div>
          ) : (
            <p className="whitespace-pre-wrap">{content}</p>
          )}
        </div>
      </div>
    </div>
  );
};

const QuestionCard: React.FC<{
  question: IntakeQuestion;
  onAnswer: (answer: string | string[] | number | Date | File[]) => void;
  isLoading?: boolean;
}> = ({ question, onAnswer, isLoading = false }) => {
  const [answer, setAnswer] = useState<string | string[] | number | Date | File[]>("");
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);

  const handleSubmit = () => {
    if (question.required && (!answer || (Array.isArray(answer) && answer.length === 0))) {
      return;
    }
    onAnswer(answer);
  };

  const renderInput = () => {
    switch (question.type) {
      case "text":
        return (
          <Input
            placeholder={question.placeholder || "Type your answer..."}
            value={answer as string}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={isLoading}
            className="w-full"
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        );
      
      case "textarea":
        return (
          <Textarea
            placeholder={question.placeholder || "Type your answer..."}
            value={answer as string}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={isLoading}
            className="w-full min-h-[100px]"
          />
        );
      
      case "select":
        return (
          <select
            value={answer as string}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={isLoading}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <option value="">Select an option...</option>
            {question.options?.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      
      case "multiselect":
        return (
          <div className="space-y-2">
            {question.options?.map((option) => (
              <div key={option} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={option}
                  checked={selectedOptions.includes(option)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      const newOptions = [...selectedOptions, option];
                      setSelectedOptions(newOptions);
                      setAnswer(newOptions);
                    } else {
                      const newOptions = selectedOptions.filter(o => o !== option);
                      setSelectedOptions(newOptions);
                      setAnswer(newOptions);
                    }
                  }}
                  disabled={isLoading}
                  className="rounded border-input"
                />
                <label htmlFor={option} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {option}
                </label>
              </div>
            ))}
          </div>
        );
      
      case "number":
        return (
          <Input
            type="number"
            placeholder={question.placeholder || "Enter a number..."}
            value={answer as number}
            onChange={(e) => setAnswer(Number(e.target.value))}
            disabled={isLoading}
            className="w-full"
            min={question.validation?.min}
            max={question.validation?.max}
            onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
          />
        );
      
      case "date":
        return (
          <Input
            type="date"
            value={answer as string}
            onChange={(e) => setAnswer(new Date(e.target.value))}
            disabled={isLoading}
            className="w-full"
          />
        );
      
      case "file":
        return (
          <div className="space-y-2">
            <Input
              type="file"
              multiple
              onChange={(e) => {
                const files = Array.from(e.target.files || []);
                setAnswer(files);
              }}
              disabled={isLoading}
              className="w-full"
            />
            <p className="text-xs text-muted-foreground">
              You can upload multiple files
            </p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-primary/20 shadow-lg">
      <CardContent className="p-6">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-primary to-primary/80 text-primary-foreground flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">{question.question}</h3>
              {question.required && (
                <Badge variant="secondary" className="text-xs">
                  Required
                </Badge>
              )}
            </div>
          </div>
          
          <div className="ml-11">
            {renderInput()}
          </div>
          
          <div className="flex justify-end ml-11">
            <Button 
              onClick={handleSubmit}
              disabled={isLoading || (question.required && (!answer || (Array.isArray(answer) && answer.length === 0)))}
              className="gap-2 hover:scale-105 transition-transform duration-200"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Submit Answer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const QualificationScore: React.FC<{ score: number }> = ({ score }) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Review";
  };

  return (
    <Card className="w-full max-w-2xl mx-auto border-green-200 bg-green-50">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-500 text-white flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">Qualification Score</h3>
            <p className="text-sm text-muted-foreground">
              Based on your responses, here's your project qualification score
            </p>
          </div>
        </div>
        
        <div className="ml-11">
          <div className="flex items-center gap-4 mb-4">
            <div className={cn("text-3xl font-bold", getScoreColor(score))}>
              {score}%
            </div>
            <div>
              <div className={cn("text-lg font-semibold", getScoreColor(score))}>
                {getScoreLabel(score)}
              </div>
              <div className="w-32 bg-muted rounded-full h-2">
                <div 
                  className={cn(
                    "h-2 rounded-full transition-all duration-500",
                    score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500"
                  )}
                  style={{ width: `${score}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AISuggestions: React.FC<{ suggestions: string[] }> = ({ suggestions }) => {
  return (
    <Card className="w-full max-w-2xl mx-auto border-blue-200 bg-blue-50">
      <CardContent className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-lg font-semibold">AI Suggestions</h3>
            <p className="text-sm text-muted-foreground">
              Based on your responses, here are some recommendations
            </p>
          </div>
        </div>
        
        <div className="ml-11">
          <ul className="space-y-2">
            {suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start gap-2">
                <ArrowRight className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm">{suggestion}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export const AIIntakeChat: React.FC<AIIntakeChatProps> = ({
  questions,
  onResponseSubmit,
  isLoading = false,
  currentQuestionIndex,
  qualificationScore,
  aiSuggestions = []
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [messages, setMessages] = useState<MessageProps[]>([]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    // Initialize with welcome message
    if (messages.length === 0) {
      setMessages([{
        type: "ai",
        content: "Welcome! I'm your AI assistant. I'll help you through our intake process to understand your project needs better. Let's get started!",
        timestamp: new Date().toLocaleTimeString()
      }]);
    }
  }, [messages.length]);

  const handleAnswer = (answer: string | string[] | number | Date | File[]) => {
    const currentQuestion = questions[currentQuestionIndex];
    if (!currentQuestion) return;

    // Add user message
    const userMessage: MessageProps = {
      type: "user",
      content: Array.isArray(answer) ? answer.join(", ") : String(answer),
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMessage]);

    // Create response object
    const response: IntakeResponse = {
      question_id: currentQuestion.id,
      answer,
      timestamp: new Date().toISOString()
    };

    // Submit response
    onResponseSubmit(response);
  };

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="space-y-6">
      {/* Messages */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {messages.map((message, index) => (
          <Message key={index} {...message} />
        ))}
        
        {isLoading && (
          <Message
            type="ai"
            content=""
            timestamp=""
            isTyping={true}
          />
        )}
      </div>

      {/* Current Question */}
      {currentQuestion && (
        <QuestionCard
          question={currentQuestion}
          onAnswer={handleAnswer}
          isLoading={isLoading}
        />
      )}

      {/* Qualification Score */}
      {qualificationScore !== undefined && (
        <QualificationScore score={qualificationScore} />
      )}

      {/* AI Suggestions */}
      {aiSuggestions.length > 0 && (
        <AISuggestions suggestions={aiSuggestions} />
      )}

      <div ref={messagesEndRef} />
    </div>
  );
};