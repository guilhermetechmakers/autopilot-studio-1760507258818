import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Clock, Play, Square, Plus, Download, Filter } from 'lucide-react';
import { formatDuration, formatCurrency } from '@/lib/utils';

// Mock data for demonstration
const mockStats = {
  total_hours: 156.5,
  billable_hours: 142.3,
  non_billable_hours: 14.2,
  total_earnings: 14230.50,
};

const mockTimeEntries = [
  {
    id: '1',
    project_id: 'proj-1',
    task_id: 'task-1',
    description: 'Frontend development for dashboard',
    start_time: '2024-01-15T09:00:00Z',
    end_time: '2024-01-15T17:00:00Z',
    duration: 480, // 8 hours in minutes
    billable: true,
    hourly_rate: 100,
    created_at: '2024-01-15T09:00:00Z',
    updated_at: '2024-01-15T17:00:00Z',
  },
  {
    id: '2',
    project_id: 'proj-1',
    task_id: 'task-2',
    description: 'Code review and testing',
    start_time: '2024-01-16T10:00:00Z',
    end_time: '2024-01-16T12:30:00Z',
    duration: 150, // 2.5 hours in minutes
    billable: true,
    hourly_rate: 100,
    created_at: '2024-01-16T10:00:00Z',
    updated_at: '2024-01-16T12:30:00Z',
  },
  {
    id: '3',
    project_id: 'proj-2',
    task_id: 'task-3',
    description: 'Team meeting and planning',
    start_time: '2024-01-17T14:00:00Z',
    end_time: '2024-01-17T15:00:00Z',
    duration: 60, // 1 hour in minutes
    billable: false,
    hourly_rate: 0,
    created_at: '2024-01-17T14:00:00Z',
    updated_at: '2024-01-17T15:00:00Z',
  },
];

export default function TimeTrackingPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentProject, setCurrentProject] = useState('');
  const [currentDescription, setCurrentDescription] = useState('');
  const [isBillable, setIsBillable] = useState(true);

  // Mock timer functionality
  useEffect(() => {
    let interval: number;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning]);

  const handleStartTimer = () => {
    if (!currentProject || !currentDescription) {
      return;
    }
    setIsTimerRunning(true);
    setElapsedTime(0);
  };

  const handleStopTimer = () => {
    setIsTimerRunning(false);
    // Here you would save the time entry
    console.log('Time entry saved:', {
      project: currentProject,
      description: currentDescription,
      duration: elapsedTime,
      billable: isBillable,
    });
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold gradient-text">Time Tracking</h1>
            <p className="text-muted-foreground mt-2">
              Track your time, manage billable hours, and monitor productivity
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              Filter
            </Button>
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Entry
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.total_hours.toFixed(1)}h</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Billable Hours</CardTitle>
              <Badge variant="secondary" className="text-xs">Billable</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.billable_hours.toFixed(1)}h</div>
              <p className="text-xs text-muted-foreground">
                {((mockStats.billable_hours / mockStats.total_hours) * 100).toFixed(1)}% of total
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Non-Billable</CardTitle>
              <Badge variant="outline" className="text-xs">Internal</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mockStats.non_billable_hours.toFixed(1)}h</div>
              <p className="text-xs text-muted-foreground">
                Meetings, admin, etc.
              </p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
              <Badge className="text-xs">Revenue</Badge>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(mockStats.total_earnings)}</div>
              <p className="text-xs text-muted-foreground">
                Based on billable hours
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timer">Timer</TabsTrigger>
            <TabsTrigger value="timesheet">Timesheet</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Active Timer Card */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Active Timer
                  </CardTitle>
                  <CardDescription>
                    {isTimerRunning ? 'Currently tracking time' : 'No active timer'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isTimerRunning ? (
                    <div className="text-center">
                      <div className="text-4xl font-mono font-bold text-primary mb-2">
                        {formatTime(elapsedTime)}
                      </div>
                      <div className="text-sm text-muted-foreground mb-4">
                        {currentProject} • {currentDescription}
                      </div>
                      <Button 
                        onClick={handleStopTimer}
                        variant="destructive"
                        className="gap-2"
                      >
                        <Square className="h-4 w-4" />
                        Stop Timer
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground mb-4">Start tracking your time</p>
                      <Button 
                        onClick={() => setActiveTab('timer')}
                        className="gap-2"
                      >
                        <Play className="h-4 w-4" />
                        Start Timer
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Entries */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Entries</CardTitle>
                  <CardDescription>Your latest time entries</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockTimeEntries.slice(0, 3).map((entry) => (
                      <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg border">
                        <div className="space-y-1">
                          <p className="font-medium">{entry.description}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(entry.start_time).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono">{formatDuration(entry.duration)}</p>
                          <Badge variant={entry.billable ? "default" : "secondary"}>
                            {entry.billable ? 'Billable' : 'Non-billable'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Timer Tab */}
          <TabsContent value="timer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Time Tracker</CardTitle>
                <CardDescription>Start and stop time tracking for your tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Project</label>
                    <select 
                      value={currentProject}
                      onChange={(e) => setCurrentProject(e.target.value)}
                      className="w-full p-2 border rounded-md"
                    >
                      <option value="">Select a project</option>
                      <option value="proj-1">Project Alpha</option>
                      <option value="proj-2">Project Beta</option>
                      <option value="proj-3">Project Gamma</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Hourly Rate</label>
                    <input 
                      type="number"
                      placeholder="100"
                      className="w-full p-2 border rounded-md"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <input 
                    value={currentDescription}
                    onChange={(e) => setCurrentDescription(e.target.value)}
                    placeholder="What are you working on?"
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <input 
                    type="checkbox"
                    id="billable"
                    checked={isBillable}
                    onChange={(e) => setIsBillable(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="billable" className="text-sm font-medium">
                    This time is billable
                  </label>
                </div>

                <div className="flex justify-center">
                  {!isTimerRunning ? (
                    <Button 
                      onClick={handleStartTimer}
                      disabled={!currentProject || !currentDescription}
                      size="lg"
                      className="gap-2"
                    >
                      <Play className="h-5 w-5" />
                      Start Timer
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleStopTimer}
                      variant="destructive"
                      size="lg"
                      className="gap-2"
                    >
                      <Square className="h-5 w-5" />
                      Stop Timer
                    </Button>
                  )}
                </div>

                {isTimerRunning && (
                  <div className="text-center">
                    <div className="text-6xl font-mono font-bold text-primary mb-4">
                      {formatTime(elapsedTime)}
                    </div>
                    <p className="text-muted-foreground">
                      Tracking: {currentProject} • {currentDescription}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timesheet Tab */}
          <TabsContent value="timesheet" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Time Entries</CardTitle>
                <CardDescription>View and manage all your time entries</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mockTimeEntries.map((entry) => (
                    <div key={entry.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                      <div className="space-y-1">
                        <p className="font-medium">{entry.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(entry.start_time).toLocaleDateString()} • 
                          {new Date(entry.start_time).toLocaleTimeString()} - 
                          {new Date(entry.end_time!).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="font-mono font-medium">{formatDuration(entry.duration)}</p>
                          {entry.billable && entry.hourly_rate && (
                            <p className="text-sm text-muted-foreground">
                              {formatCurrency((entry.duration / 60) * entry.hourly_rate)}
                            </p>
                          )}
                        </div>
                        <Badge variant={entry.billable ? "default" : "secondary"}>
                          {entry.billable ? 'Billable' : 'Non-billable'}
                        </Badge>
                        <Button variant="ghost" size="sm">
                          Edit
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
