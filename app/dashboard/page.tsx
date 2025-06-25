"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Calendar, Users, Target, TrendingUp } from "lucide-react"
import Layout from "@/components/layout"
import MeetingModal from "@/components/meeting-modal"

export default function Dashboard() {
  const [username, setUsername] = useState("")
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false)

  // Load data from localStorage
  const [leads, setLeads] = useState([])
  const [customers, setCustomers] = useState([])
  const [tasks, setTasks] = useState([])

  useEffect(() => {
    const storedUsername = localStorage.getItem("username")
    if (storedUsername) {
      setUsername(storedUsername)
    }

    // Load data
    const savedLeads = localStorage.getItem("leads")
    const savedCustomers = localStorage.getItem("customers")
    const savedTasks = localStorage.getItem("tasks")

    if (savedLeads) setLeads(JSON.parse(savedLeads))
    if (savedCustomers) setCustomers(JSON.parse(savedCustomers))
    if (savedTasks) setTasks(JSON.parse(savedTasks))

    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const getGreeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return "Good Morning"
    if (hour < 17) return "Good Afternoon"
    return "Good Evening"
  }

  // Calculate metrics
  const totalLeads = leads.length
  const totalCustomers = customers.length
  const pendingTasks = tasks.filter((task: any) => task.status !== "completed").length
  const completedTasks = tasks.filter((task: any) => task.status === "completed").length
  const completionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

  return (
    <Layout>
      <div className="p-6 space-y-6">
        {/* Welcome Section */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-[#004360] mb-1">
            {getGreeting()}, {username}!
          </h1>
          <p className="text-gray-600 text-sm">
            {currentTime.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-l-4 border-l-[#ef7f1a]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Target className="h-4 w-4 text-[#ef7f1a]" />
                Total Leads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#ef7f1a]">{totalLeads}</div>
              <p className="text-xs text-gray-500">0 active</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#008dd2]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Users className="h-4 w-4 text-[#008dd2]" />
                Total Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#008dd2]">{totalCustomers}</div>
              <p className="text-xs text-gray-500">0 new view available</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#fecc00]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-[#fecc00]" />
                Pending Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#fecc00]">{pendingTasks}</div>
              <p className="text-xs text-gray-500">0 urgent</p>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-[#d7af00]">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#d7af00]" />
                Completion Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-[#d7af00]">{completionRate}%</div>
              <p className="text-xs text-gray-500">{completedTasks} completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold text-[#004360] mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[#ef7f1a] rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Plus className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-medium text-[#004360] mb-1">Add a Lead</h3>
                <p className="text-xs text-gray-600 mb-3">Create a new potential customer lead</p>
                <Button
                  size="sm"
                  className="bg-[#ef7f1a] hover:bg-[#d16a0f] text-white"
                  onClick={() => (window.location.href = "/leads")}
                >
                  Add Lead
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[#008dd2] rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-medium text-[#004360] mb-1">View Tasks</h3>
                <p className="text-xs text-gray-600 mb-3">Check your pending tasks and reminders</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-[#008dd2] text-[#008dd2] hover:bg-[#008dd2] hover:text-white"
                  onClick={() => (window.location.href = "/tasks")}
                >
                  View Tasks
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[#d7af00] rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Search className="h-6 w-6 text-white" />
                </div>
                <h3 className="font-medium text-[#004360] mb-1">Search Customer</h3>
                <p className="text-xs text-gray-600 mb-3">Find and view customer information</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-[#d7af00] text-[#d7af00] hover:bg-[#d7af00] hover:text-white"
                  onClick={() => (window.location.href = "/customers")}
                >
                  Search
                </Button>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-[#fecc00] rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <Users className="h-6 w-6 text-black" />
                </div>
                <h3 className="font-medium text-[#004360] mb-1">Schedule Meeting</h3>
                <p className="text-xs text-gray-600 mb-3">Add a new meeting or appointment</p>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-[#fecc00] text-[#fecc00] hover:bg-[#fecc00] hover:text-black"
                  onClick={() => setIsMeetingModalOpen(true)}
                >
                  Schedule
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Activity & Upcoming Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-[#004360]">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leads.length === 0 && customers.length === 0 && tasks.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No recent activity</p>
                ) : (
                  <>
                    {leads.slice(0, 3).map((lead: any, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        <div className="w-2 h-2 bg-[#ef7f1a] rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">New lead added: {lead.name}</p>
                          <p className="text-xs text-gray-600">{lead.createdDate}</p>
                        </div>
                      </div>
                    ))}
                    {tasks.slice(0, 2).map((task: any, index) => (
                      <div key={index} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                        <div className="w-2 h-2 bg-[#008dd2] rounded-full"></div>
                        <div>
                          <p className="text-sm font-medium">Task: {task.title}</p>
                          <p className="text-xs text-gray-600">Due: {task.dueDate}</p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-[#004360]">Upcoming Tasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tasks.filter((task: any) => task.status !== "completed").length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No upcoming tasks</p>
                    <p className="text-xs">All caught up!</p>
                  </div>
                ) : (
                  tasks
                    .filter((task: any) => task.status !== "completed")
                    .slice(0, 5)
                    .map((task: any, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div>
                          <p className="text-sm font-medium">{task.title}</p>
                          <p className="text-xs text-gray-600">Due: {task.dueDate}</p>
                        </div>
                        <Badge
                          className={
                            task.priority === "high"
                              ? "bg-[#ef7f1a] text-white"
                              : task.priority === "medium"
                                ? "bg-[#fecc00] text-black"
                                : "bg-[#008dd2] text-white"
                          }
                        >
                          {task.priority}
                        </Badge>
                      </div>
                    ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <MeetingModal isOpen={isMeetingModalOpen} onClose={() => setIsMeetingModalOpen(false)} />
    </Layout>
  )
}
