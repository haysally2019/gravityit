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
  const [viewMode, setViewMode] = useState<"calendar" | "list">("calendar");

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
          <h1 className="text-3xl font-bold text-slate-900">Interview Scheduling</h1>
          <p className="text-slate-600 mt-1">Manage and track candidate interviews</p>
        </div>
        <button className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md">
          <Plus size={20} />
          Schedule Interview
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-lg bg-blue-50">
              <Calendar className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Scheduled</p>
              <p className="text-2xl font-bold text-slate-900">{stats.scheduled}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-lg bg-green-50">
              <Clock className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">This Week</p>
              <p className="text-2xl font-bold text-slate-900">{stats.thisWeek}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 rounded-lg bg-purple-50">
              <User className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-600">Completed</p>
              <p className="text-2xl font-bold text-slate-900">{stats.completed}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900">Calendar View</h3>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <ChevronLeft size={20} className="text-slate-600" />
              </button>
              <span className="text-sm font-medium text-slate-700 px-4">
                {selectedDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
              </span>
              <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                <ChevronRight size={20} className="text-slate-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
              <div key={day} className="text-center text-sm font-semibold text-slate-600 py-2">
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
                      ? "bg-blue-600 text-white font-semibold"
                      : hasInterview
                      ? "bg-blue-50 text-blue-600 font-medium"
                      : date.getMonth() !== selectedDate.getMonth()
                      ? "text-slate-300"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Today's Interviews</h3>
          <div className="space-y-3">
            {todayInterviews.length > 0 ? (
              todayInterviews.map((interview) => (
                <div key={interview.id} className="p-4 border border-slate-200 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    {interview.type === "video" && <Video size={16} className="text-blue-600" />}
                    {interview.type === "phone" && <Clock size={16} className="text-green-600" />}
                    {interview.type === "in-person" && <MapPin size={16} className="text-purple-600" />}
                    <span className="text-sm font-medium text-slate-900">{interview.time}</span>
                  </div>
                  <h4 className="font-semibold text-slate-900">{interview.candidateName}</h4>
                  <p className="text-sm text-slate-600">{interview.position}</p>
                  {interview.location && (
                    <p className="text-xs text-slate-500 mt-2">{interview.location}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-slate-500 text-center py-8">No interviews today</p>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-slate-900">Upcoming Interviews</h3>
          <button className="flex items-center gap-2 px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors text-sm">
            <Filter size={16} />
            Filter
          </button>
        </div>

        <div className="space-y-3">
          {mockInterviews.map((interview) => (
            <div
              key={interview.id}
              className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-semibold">{interview.candidateName[0]}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">{interview.candidateName}</h4>
                  <p className="text-sm text-slate-600">{interview.position}</p>
                </div>
              </div>

              <div className="flex items-center gap-6">
                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Calendar size={16} />
                    <span>{new Date(interview.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-slate-500 mt-1">
                    <Clock size={16} />
                    <span>{interview.time}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {interview.type === "video" && (
                    <div className="p-2 bg-blue-50 rounded-lg" title="Video Call">
                      <Video size={18} className="text-blue-600" />
                    </div>
                  )}
                  {interview.type === "phone" && (
                    <div className="p-2 bg-green-50 rounded-lg" title="Phone Call">
                      <Clock size={18} className="text-green-600" />
                    </div>
                  )}
                  {interview.type === "in-person" && (
                    <div className="p-2 bg-purple-50 rounded-lg" title="In-Person">
                      <MapPin size={18} className="text-purple-600" />
                    </div>
                  )}
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    interview.status === "scheduled"
                      ? "bg-blue-100 text-blue-700"
                      : interview.status === "completed"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
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
