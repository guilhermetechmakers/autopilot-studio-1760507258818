import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";
import type { BookingSlot } from "@/types";

interface BookingCalendarProps {
  slots: BookingSlot[];
  selectedSlotId?: string;
  onSlotSelect: (slotId: string) => void;
  isLoading?: boolean;
  timezone?: string;
}

interface DaySlots {
  date: string;
  slots: BookingSlot[];
}

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  slots,
  selectedSlotId,
  onSlotSelect,
  isLoading = false,
  timezone = "UTC"
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [groupedSlots, setGroupedSlots] = useState<DaySlots[]>([]);

  // Group slots by date
  useEffect(() => {
    const grouped = slots.reduce((acc, slot) => {
      const slotDate = new Date(slot.start_time).toDateString();
      const existingDay = acc.find(day => day.date === slotDate);
      
      if (existingDay) {
        existingDay.slots.push(slot);
      } else {
        acc.push({
          date: slotDate,
          slots: [slot]
        });
      }
      
      return acc;
    }, [] as DaySlots[]);

    // Sort by date
    grouped.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setGroupedSlots(grouped);
  }, [slots]);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: timezone
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Today";
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return "Tomorrow";
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      });
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentDate(newDate);
  };

  const getVisibleDays = () => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek);
      day.setDate(day.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getSlotsForDate = (date: Date) => {
    const dateString = date.toDateString();
    return groupedSlots.find(day => day.date === dateString)?.slots || [];
  };

  const visibleDays = getVisibleDays();

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Select a Time Slot
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Loading available time slots...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Select a Time Slot
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('prev')}
              disabled={isLoading}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateDate('next')}
              disabled={isLoading}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Choose a convenient time for your AI-assisted intake session
        </p>
      </CardHeader>
      <CardContent>
        {groupedSlots.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Available Slots</h3>
            <p className="text-muted-foreground">
              There are no available time slots in the selected period. Please try a different date range.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Week View */}
            <div className="grid grid-cols-7 gap-2 mb-6">
              {visibleDays.map((day, index) => {
                const daySlots = getSlotsForDate(day);
                const isToday = day.toDateString() === new Date().toDateString();
                const hasSlots = daySlots.length > 0;
                
                return (
                  <div
                    key={index}
                    className={cn(
                      "text-center p-3 rounded-lg border transition-colors",
                      isToday && "bg-primary/5 border-primary/20",
                      hasSlots && "hover:bg-muted/50 cursor-pointer",
                      !hasSlots && "opacity-50"
                    )}
                  >
                    <div className="text-xs font-medium text-muted-foreground mb-1">
                      {day.toLocaleDateString('en-US', { weekday: 'short' })}
                    </div>
                    <div className={cn(
                      "text-lg font-semibold",
                      isToday && "text-primary"
                    )}>
                      {day.getDate()}
                    </div>
                    {hasSlots && (
                      <Badge variant="secondary" className="text-xs mt-1">
                        {daySlots.length} slots
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Available Slots */}
            <div className="space-y-4">
              {groupedSlots.map((dayGroup) => (
                <div key={dayGroup.date} className="space-y-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    {formatDate(dayGroup.date)}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {dayGroup.slots.map((slot) => {
                      const isSelected = selectedSlotId === slot.id;
                      const isAvailable = slot.is_available;
                      
                      return (
                        <Button
                          key={slot.id}
                          variant={isSelected ? "default" : "outline"}
                          className={cn(
                            "h-auto p-4 flex flex-col items-center gap-2 transition-all duration-200",
                            isSelected && "ring-2 ring-primary ring-offset-2",
                            !isAvailable && "opacity-50 cursor-not-allowed",
                            isAvailable && !isSelected && "hover:scale-105 hover:shadow-md"
                          )}
                          onClick={() => isAvailable && onSlotSelect(slot.id)}
                          disabled={!isAvailable || isLoading}
                        >
                          <div className="flex items-center gap-2">
                            {isAvailable ? (
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            ) : (
                              <XCircle className="w-4 h-4 text-red-600" />
                            )}
                            <span className="font-medium">
                              {formatTime(slot.start_time)}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {isAvailable ? "Available" : "Unavailable"}
                          </div>
                        </Button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};