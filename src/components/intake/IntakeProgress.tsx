import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface IntakeProgressProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number;
  currentStepName: string;
  qualificationScore?: number;
}

export const IntakeProgress: React.FC<IntakeProgressProps> = ({
  currentStep,
  totalSteps,
  completedSteps,
  currentStepName,
  qualificationScore
}) => {
  const progressPercentage = (completedSteps / totalSteps) * 100;

  const getStepIcon = (step: number) => {
    if (step < completedSteps) {
      return <CheckCircle className="w-4 h-4 text-green-600" />;
    }
    if (step === currentStep) {
      return <Clock className="w-4 h-4 text-primary" />;
    }
    return <FileText className="w-4 h-4 text-muted-foreground" />;
  };

  const getStepStatus = (step: number) => {
    if (step < completedSteps) return "completed";
    if (step === currentStep) return "current";
    return "upcoming";
  };

  return (
    <Card className="w-full">
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Intake Progress</h3>
              <p className="text-sm text-muted-foreground">
                Step {currentStep} of {totalSteps}: {currentStepName}
              </p>
            </div>
            {qualificationScore !== undefined && (
              <Badge 
                variant={qualificationScore >= 80 ? "default" : qualificationScore >= 60 ? "secondary" : "destructive"}
                className="text-sm"
              >
                Score: {qualificationScore}%
              </Badge>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium">{Math.round(progressPercentage)}%</span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: totalSteps }, (_, index) => {
              const step = index + 1;
              const status = getStepStatus(step);
              
              return (
                <div
                  key={step}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-colors",
                    status === "completed" && "bg-green-50 border border-green-200",
                    status === "current" && "bg-primary/5 border border-primary/20",
                    status === "upcoming" && "bg-muted/50"
                  )}
                >
                  {getStepIcon(step)}
                  <div className="flex-1 min-w-0">
                    <div className={cn(
                      "text-sm font-medium",
                      status === "completed" && "text-green-900",
                      status === "current" && "text-primary",
                      status === "upcoming" && "text-muted-foreground"
                    )}>
                      Step {step}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {status === "completed" && "Completed"}
                      {status === "current" && "In Progress"}
                      {status === "upcoming" && "Upcoming"}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
