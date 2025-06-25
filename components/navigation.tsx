"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Home, Users, Target, Calendar, BarChart3, Settings, Search, User, LogOut, Menu, X } from "lucide-react"

export default function Navigation() {
  const [username, setUsername] = useState("")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const storedUsername = localStorage.getItem("username")
    if (storedUsername) {
      setUsername(storedUsername)
    }
  }, [])

  useEffect(() => {
    if (searchQuery.length > 2) {
      performSearch(searchQuery)
    } else {
      setSearchResults([])
    }
  }, [searchQuery])

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

    setSearchResults(results.slice(0, 10)) // Limit to 10 results
  }

  const handleLogout = () => {
    localStorage.removeItem("isLoggedIn")
    localStorage.removeItem("username")
    window.location.href = "/"
  }

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Leads", href: "/leads", icon: Target },
    { name: "Tasks", href: "/tasks", icon: Calendar },
    { name: "Reports", href: "/reports", icon: BarChart3 },
  ]

  const currentPath = typeof window !== "undefined" ? window.location.pathname : ""

  return (
    <nav className="bg-[#004360] text-white shadow-lg">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <div className="flex items-center gap-4">
            <div className="text-xl font-bold">
              THYNKWEALTH
              <div className="text-xs opacity-90">ADVISORY SERVICES LLP</div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navigationItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPath === item.href
              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                    isActive ? "bg-[#008dd2] text-white" : "text-white hover:bg-[#005a7a] hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </a>
              )
            })}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Global Search */}
            <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-white hover:bg-[#005a7a]">
                  <Search className="h-4 w-4" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-[#004360]">Global Search</DialogTitle>
                  <DialogDescription>Search across customers, leads, and tasks</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search for customers, leads, tasks..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 border-[#004360] focus:border-[#008dd2]"
                      autoFocus
                    />
                  </div>

                  {searchResults.length > 0 && (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      <h4 className="font-medium text-[#004360]">Search Results</h4>
                      {searchResults.map((result, index) => (
                        <div
                          key={`${result.type}-${result.id}-${index}`}
                          className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                          onClick={() => {
                            if (result.type === "customer") {
                              window.location.href = "/customers"
                            } else if (result.type === "lead") {
                              window.location.href = "/leads"
                            } else if (result.type === "task") {
                              window.location.href = "/tasks"
                            }
                            setIsSearchOpen(false)
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
                  )}

                  {searchQuery.length > 2 && searchResults.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No results found for "{searchQuery}"</p>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-[#005a7a]">
                  <div className="w-8 h-8 bg-[#008dd2] rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {username.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:block">{username}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
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

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-white hover:bg-[#005a7a]"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-[#005a7a]">
            <div className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = currentPath === item.href
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                      isActive ? "bg-[#008dd2] text-white" : "text-white hover:bg-[#005a7a]"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </a>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
