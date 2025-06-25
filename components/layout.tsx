"use client"

import type React from "react"
import { useState, useEffect } from "react"
import styles from "./layout.module.css"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Home,
  Users,
  Target,
  Calendar,
  BarChart3,
  Settings,
  Search,
  User,
  LogOut,
  Package,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import Image from "next/image"
import NotificationPanel from "./notification-panel"
import { usePathname } from "next/navigation"

interface LayoutProps {
  children: React.ReactNode
}

export default function Layout({ children }: LayoutProps) {
  const [username, setUsername] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [showSearchResults, setShowSearchResults] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    const storedUsername = localStorage.getItem("username")
    if (storedUsername) {
      setUsername(storedUsername)
    }

    // Load and sync notifications with recent activities
    loadRecentActivities()
  }, [])

  useEffect(() => {
    if (searchQuery.length > 2) {
      performSearch(searchQuery)
      setShowSearchResults(true)
    } else {
      setSearchResults([])
      setShowSearchResults(false)
    }
  }, [searchQuery])

  const loadRecentActivities = () => {
    const activities: any[] = []

    // Load recent customer activities
    const customers = JSON.parse(localStorage.getItem("customers") || "[]")
    customers.forEach((customer: any) => {
      if (customer.interactions && customer.interactions.length > 0) {
        customer.interactions.slice(-2).forEach((interaction: any) => {
          activities.push({
            id: `customer-${customer.id}-${interaction.id}`,
            title: `Customer Interaction: ${interaction.type}`,
            message: `${interaction.type} with ${customer.name}: ${interaction.description}`,
            priority: "normal" as const,
            time: getTimeAgo(interaction.date),
            read: false,
            type: "customer",
            relatedId: customer.id,
          })
        })
      }
    })

    // Load recent lead activities
    const leads = JSON.parse(localStorage.getItem("leads") || "[]")
    leads.forEach((lead: any) => {
      if (lead.activities && lead.activities.length > 0) {
        lead.activities.slice(-2).forEach((activity: any) => {
          activities.push({
            id: `lead-${lead.id}-${activity.id}`,
            title: `Lead Activity: ${activity.type}`,
            message: `${activity.type} with ${lead.name}: ${activity.description}`,
            priority: "important" as const,
            time: getTimeAgo(activity.date),
            read: false,
            type: "lead",
            relatedId: lead.id,
          })
        })
      }
    })

    // Load recent task activities
    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]")
    tasks
      .filter((task: any) => task.status === "completed")
      .slice(-2)
      .forEach((task: any) => {
        activities.push({
          id: `task-${task.id}`,
          title: "Task Completed",
          message: `Task "${task.title}" has been completed`,
          priority: "normal" as const,
          time: getTimeAgo(task.completedDate || task.createdDate),
          read: false,
          type: "task",
          relatedId: task.id,
        })
      })

    // Load recent meeting activities
    const meetings = JSON.parse(localStorage.getItem("meetings") || "[]")
    meetings.slice(-2).forEach((meeting: any) => {
      activities.push({
        id: `meeting-${meeting.id}`,
        title: "Meeting Scheduled",
        message: `Meeting "${meeting.title}" scheduled for ${meeting.date}`,
        priority: "important" as const,
        time: getTimeAgo(meeting.createdDate),
        read: false,
        type: "meeting",
        relatedId: meeting.id,
      })
    })

    // Sort by most recent and take top 8
    const sortedActivities = activities
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 8)

    setNotifications(sortedActivities)
  }

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`
    }
  }

  const performSearch = (query: string) => {
    const results: any[] = []

    // Search customers
    const customers = JSON.parse(localStorage.getItem("customers") || "[]")
    const matchingCustomers = customers.filter(
      (customer: any) =>
        customer.name.toLowerCase().includes(query.toLowerCase()) ||
        customer.email.toLowerCase().includes(query.toLowerCase()) ||
        customer.company.toLowerCase().includes(query.toLowerCase()),
    )
    results.push(...matchingCustomers.map((c: any) => ({ ...c, type: "customer" })))

    // Search leads
    const leads = JSON.parse(localStorage.getItem("leads") || "[]")
    const matchingLeads = leads.filter(
      (lead: any) =>
        lead.name.toLowerCase().includes(query.toLowerCase()) ||
        lead.email.toLowerCase().includes(query.toLowerCase()) ||
        lead.company.toLowerCase().includes(query.toLowerCase()),
    )
    results.push(...matchingLeads.map((l: any) => ({ ...l, type: "lead" })))

    // Search tasks
    const tasks = JSON.parse(localStorage.getItem("tasks") || "[]")
    const matchingTasks = tasks.filter(
      (task: any) =>
        task.title.toLowerCase().includes(query.toLowerCase()) ||
        task.description.toLowerCase().includes(query.toLowerCase()),
    )
    results.push(...matchingTasks.map((t: any) => ({ ...t, type: "task" })))

    // Search meetings
    const meetings = JSON.parse(localStorage.getItem("meetings") || "[]")
    const matchingMeetings = meetings.filter(
      (meeting: any) =>
        meeting.title.toLowerCase().includes(query.toLowerCase()) ||
        meeting.description.toLowerCase().includes(query.toLowerCase()),
    )
    results.push(...matchingMeetings.map((m: any) => ({ ...m, type: "meeting" })))

    setSearchResults(results.slice(0, 10))
  }

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("username")
    window.location.href = "/"
  }

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Lead Management", href: "/leads", icon: Target },
    { name: "Customer 360", href: "/customers", icon: Users },
    { name: "Tasks & Reminders", href: "/tasks", icon: Calendar },
    { name: "Meetings", href: "/meetings", icon: Calendar },
    { name: "Products & Services", href: "/products", icon: Package },
    { name: "Reports & Analytics", href: "/reports", icon: BarChart3 },
    { name: "Settings", href: "/settings", icon: Settings },
  ]

  const currentPath = usePathname()

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Fixed Sidebar */}
      <div
        className={`bg-gradient-to-b from-[#3a6b85] to-[#2c5f7a] text-white transition-all duration-300 ${
          isSidebarCollapsed ? "w-16" : "w-64"
        } flex flex-col fixed left-0 top-0 h-full z-30 shadow-lg`}
      >
        {/* Logo Section */}
        <div className="p-4 border-b border-white/20">
          <div className="flex items-center justify-center">
            {!isSidebarCollapsed ? (
              <div className="flex items-center justify-center w-full">
                <Image
                  src="/thynkwealth-logo.svg"
                  alt="THYNKWEALTH"
                  width={180}
                  height={40}
                  className="object-contain filter brightness-0 invert"
                />
              </div>
            ) : (
              <div className="w-8 h-8 bg-[#ef7f1a] rounded-lg flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-white font-bold text-sm">TW</span>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPath === item.href
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-200 group ${
                    isActive
                      ? "bg-white/20 text-white shadow-md border-l-4 border-[#ef7f1a]"
                      : "text-white/80 hover:bg-white/10 hover:text-white hover:shadow-sm"
                  }`}
                  title={isSidebarCollapsed ? item.name : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isSidebarCollapsed && (
                    <span className="text-sm font-medium transition-all duration-200">{item.name}</span>
                  )}
                </a>
              )
            })}
          </div>
        </nav>

        {/* Collapse Toggle */}
        <div className="p-4 border-t border-white/20">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full text-white hover:bg-white/10 justify-center transition-all duration-200"
          >
            {isSidebarCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4" />
                <span className="ml-2">Collapse</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? "ml-16" : "ml-64"}`}>
        <header
          className={`bg-white border-b border-gray-200 px-6 py-4 fixed top-0 right-0 left-0 z-20 shadow-sm ${
            isSidebarCollapsed ? "header-collapsed" : "header-expanded"
          }`}
        >
          <div className="flex justify-center items-center gap-4">
            {/* Global Search */}
            <div className="w-full max-w-md mx-auto relative">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input
                  placeholder="Search across customers, leads, tasks, and meetings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-3 text-base border-[#008dd2] focus:border-[#004360] focus:ring-[#004360] rounded-lg shadow-sm"
                  onFocus={() => searchQuery.length > 2 && setShowSearchResults(true)}
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSearchQuery("")
                      setShowSearchResults(false)
                    }}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
                  {searchResults.length > 0 ? (
                    <div className="p-2">
                      <div className="text-sm font-medium text-gray-600 px-3 py-2">Search Results</div>
                      {searchResults.map((result, index) => (
                        <div
                          key={`${result.type}-${result.id}-${index}`}
                          className="p-3 hover:bg-gray-50 cursor-pointer rounded-md transition-colors"
                          onClick={() => {
                            if (result.type === "customer") {
                              window.location.href = "/customers"
                            } else if (result.type === "lead") {
                              window.location.href = "/leads"
                            } else if (result.type === "task") {
                              window.location.href = "/tasks"
                            } else if (result.type === "meeting") {
                              window.location.href = "/meetings"
                            }
                            setShowSearchResults(false)
                            setSearchQuery("")
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h5 className="font-medium text-[#004360]">{result.name || result.title}</h5>
                              <p className="text-sm text-gray-600">
                                {result.email || result.description || result.company}
                              </p>
                            </div>
                            <Badge variant="outline" className="capitalize">
                              {result.type}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : searchQuery.length > 2 ? (
                    <div className="p-8 text-center text-gray-500">
                      <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No results found for "{searchQuery}"</p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <NotificationPanel
                notifications={notifications}
                setNotifications={setNotifications}
                onRefresh={loadRecentActivities}
              />

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 text-[#004360] hover:bg-gray-100 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-[#008dd2] to-[#004360] rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {username.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:block font-medium">{username}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 shadow-lg">
                  <DropdownMenuItem className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Application Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem className="flex items-center gap-2 text-red-600" onClick={handleLogout}>
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content with top margin for fixed header */}
        <main className="flex-1 overflow-auto pt-20">{children}</main>
      </div>

      {/* Click outside to close search results */}
      {showSearchResults && <div className="fixed inset-0 z-40" onClick={() => setShowSearchResults(false)} />}
    </div>
  )
}
