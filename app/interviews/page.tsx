"use client";

import React, { useState } from "react";
import { Calendar, Clock, Video, MapPin, User, Plus, Filter, ChevronLeft, ChevronRight } from "lucide-react";

interface Interview {
  id: string;
  candidateName: string;
  position: string;
  date: string;
  time: string;
  type: "video" | "phone" | "in-person";
  status: "scheduled" | "completed" | "cancelled";
  location?: string;
  notes?: string;
}

export default function InterviewsPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  // Mock data preserved
  const mockInterviews: Interview[] = [
    {
      id: "1",
      candidateName: "John Smith",
      position: "Roofing Sales Rep",
      date: "2025-11-10",
      time: "10:00 AM",
      type: "video",
      status: "scheduled",
    },
    {
      id: "2",
      candidateName: "Sarah Johnson",
      position: "Sales Manager",
      date: "2025-11-10",
      time: "2:00 PM",
      type: "phone",
      status: "scheduled",
    },
    {
      id: "3",
      candidateName: "Mike Davis",
      position: "Roofing Sales Rep",
      date: "2025-11-11",
      time: "11:00 AM",
      type: "in-person",
      status: "scheduled",
      location: "Office - Conference Room A",
    },
  ];

  const stats = {
    scheduled: mockInterviews.filter((i) => i.status === "scheduled").length,
    completed: mockInterviews.filter((i) => i.status === "completed").length,
    thisWeek: mockInterviews.length,
  };

  const today = new Date().toISOString().split("T")[0];
  const todayInterviews = mockInterviews.filter((i) => i.date === today);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Interview Scheduling</h1>
          <p className="text-muted-foreground mt-1">Manage and track candidate interviews</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-lg hover:bg-primary/90 transition-colors shadow-md">
          <Plus size={20} />
          Schedule Interview
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-lg bg-blue-500/10">
              <Calendar className="text-blue-500" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Scheduled</p>
              <p className="text-2xl font-bold">{stats.scheduled}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-lg bg-green-500/10">
              <Clock className="text-green-500" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">This Week</p>
              <p className="text-2xl font-bold">{stats.thisWeek}</p>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-lg bg-purple-500/10">
              <User className="text-purple-500" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-card rounded-xl shadow-sm border border-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Calendar View</h3>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                <ChevronLeft size={20} />
              </button>
              <span className="text-sm font-medium px-4">
                {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
              <button className="p-2 hover:bg-muted rounded-lg transition-colors text-muted-foreground hover:text-foreground">
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }, (_, i) => {
              const date = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), i - 5);
              const dateStr = date.toISOString().split("T")[0];
              const hasInterview = mockInterviews.some((interview) => interview.date === dateStr);
              const isToday = dateStr === today;

              return (
                <button
                  key={i}
                  className={`aspect-square p-2 rounded-lg text-sm transition-colors ${
                    isToday
                      ? "bg-primary text-primary-foreground font-semibold"
                      : hasInterview
                      ? "bg-primary/10 text-primary font-medium"
                      : date.getMonth() !== selectedDate.getMonth()
                      ? "text-muted-foreground/30"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-card rounded-xl shadow-sm border border-border p-6">
          <h3 className="text-lg font-semibold mb-4">Today's Interviews</h3>
          <div className="space-y-3">
            {todayInterviews.length > 0 ? (
              todayInterviews.map((interview) => (
                <div key={interview.id} className="p-4 border border-border rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-2">
                    {interview.type === "video" && <Video size={16} className="text-blue-500" />}
                    {interview.type === "phone" && <Clock size={16} className="text-green-500" />}
                    {interview.type === "in-person" && <MapPin size={16} className="text-purple-500" />}
                    <span className="text-sm font-medium">{interview.time}</span>
                  </div>
                  <h4 className="font-semibold">{interview.candidateName}</h4>
                  <p className="text-sm text-muted-foreground">{interview.position}</p>
                  {interview.location && (
                    <p className="text-xs text-muted-foreground mt-2">{interview.location}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-muted-foreground text-center py-8">No interviews today</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-card rounded-xl shadow-sm border border-border p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold">Upcoming Interviews</h3>
          <button className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-muted transition-colors text-sm">
            <Filter size={16} />
            Filter
          </button>
        </div>

        <div className="space-y-3">
          {mockInterviews.map((interview) => (
            <div
              key={interview.id}
              className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <span className="text-primary font-semibold">{interview.candidateName[0]}</span>
                </div>
                <div>
                  <h4 className="font-semibold">{interview.candidateName}</h4>
                  <p className="text-sm text-muted-foreground">{interview.position}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar size={16} />
                    <span>{new Date(interview.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                    <Clock size={16} />
                    <span>{interview.time}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {interview.type === "video" && (
                    <div className="p-2 bg-blue-500/10 rounded-lg" title="Video Call">
                      <Video size={18} className="text-blue-500" />
                    </div>
                  )}
                  {interview.type === "phone" && (
                    <div className="p-2 bg-green-500/10 rounded-lg" title="Phone Call">
                      <Clock size={18} className="text-green-500" />
                    </div>
                  )}
                  {interview.type === "in-person" && (
                    <div className="p-2 bg-purple-500/10 rounded-lg" title="In-Person">
                      <MapPin size={18} className="text-purple-500" />
                    </div>
                  )}
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    interview.status === "scheduled"
                      ? "bg-blue-500/10 text-blue-500"
                      : interview.status === "completed"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-destructive/10 text-destructive"
                  }`}
                >
                  {interview.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}