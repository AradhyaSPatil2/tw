"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import { TrendingUp, TrendingDown, Users, DollarSign, Target, Calendar, Download, Edit } from "lucide-react"
import Layout from "@/components/layout"

interface RevenueTarget {
  month: string
  target: number
  actual: number
}

export default function ReportsPage() {
  const [customers, setCustomers] = useState<any[]>([])
  const [leads, setLeads] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [meetings, setMeetings] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [customerProducts, setCustomerProducts] = useState<any[]>([])
  const [revenueTargets, setRevenueTargets] = useState<RevenueTarget[]>([])
  const [isEditTargetOpen, setIsEditTargetOpen] = useState(false)
  const [editingTarget, setEditingTarget] = useState<RevenueTarget | null>(null)

  useEffect(() => {
    // Load data from localStorage
    const savedCustomers = localStorage.getItem("customers")
    const savedLeads = localStorage.getItem("leads")
    const savedTasks = localStorage.getItem("tasks")
    const savedMeetings = localStorage.getItem("meetings")
    const savedProducts = localStorage.getItem("products")
    const savedCustomerProducts = localStorage.getItem("customerProducts")
    const savedTargets = localStorage.getItem("revenueTargets")

    if (savedCustomers) setCustomers(JSON.parse(savedCustomers))
    if (savedLeads) setLeads(JSON.parse(savedLeads))
    if (savedTasks) setTasks(JSON.parse(savedTasks))
    if (savedMeetings) setMeetings(JSON.parse(savedMeetings))
    if (savedProducts) setProducts(JSON.parse(savedProducts))
    if (savedCustomerProducts) setCustomerProducts(JSON.parse(savedCustomerProducts))

    if (savedTargets) {
      setRevenueTargets(JSON.parse(savedTargets))
    } else {
      // Initialize with current year targets
      const currentYear = new Date().getFullYear()
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

      const initialTargets = months.map((month, index) => ({
        month: `${month} ${currentYear}`,
        target: 500000 + index * 50000, // Progressive targets in INR
        actual: Math.floor(Math.random() * 600000) + 300000, // Simulated actual values
      }))

      setRevenueTargets(initialTargets)
      localStorage.setItem("revenueTargets", JSON.stringify(initialTargets))
    }
  }, [])

  const saveRevenueTargets = (updatedTargets: RevenueTarget[]) => {
    setRevenueTargets(updatedTargets)
    localStorage.setItem("revenueTargets", JSON.stringify(updatedTargets))
  }

  const updateTarget = () => {
    if (editingTarget) {
      const updatedTargets = revenueTargets.map((target) =>
        target.month === editingTarget.month ? editingTarget : target,
      )
      saveRevenueTargets(updatedTargets)
      setIsEditTargetOpen(false)
      setEditingTarget(null)
    }
  }

  // Calculate metrics
  const totalCustomers = customers.length
  const activeCustomers = customers.filter((c) => c.status === "active" || c.status === "client").length
  const totalLeads = leads.length
  const qualifiedLeads = leads.filter(
    (l) => l.status === "qualified" || l.status === "proposal" || l.status === "negotiation",
  ).length
  const closedWonLeads = leads.filter((l) => l.status === "closed-won").length
  const totalTasks = tasks.length
  const completedTasks = tasks.filter((t) => t.status === "completed").length
  const totalMeetings = meetings.length
  const completedMeetings = meetings.filter((m) => m.status === "completed").length

  // Revenue calculations from actual customer products
  const totalRevenue = customerProducts.reduce((sum, cp) => sum + (cp.amount || 0), 0)
  const totalTargets = revenueTargets.reduce((sum, target) => sum + target.target, 0)
  const revenueGrowth = totalTargets > 0 ? ((totalRevenue - totalTargets) / totalTargets) * 100 : 0

  // Customer value distribution
  const customerValueData = [
    { name: "High Value (>₹10L)", value: customers.filter((c) => c.value > 1000000).length, color: "#ef7f1a" },
    {
      name: "Medium Value (₹5L-₹10L)",
      value: customers.filter((c) => c.value >= 500000 && c.value <= 1000000).length,
      color: "#d7af00",
    },
    { name: "Low Value (<₹5L)", value: customers.filter((c) => c.value < 500000).length, color: "#008dd2" },
  ]

  // Lead conversion funnel
  const leadFunnelData = [
    { stage: "New", count: leads.filter((l) => l.status === "new").length },
    { stage: "Contacted", count: leads.filter((l) => l.status === "contacted").length },
    { stage: "Qualified", count: leads.filter((l) => l.status === "qualified").length },
    { stage: "Proposal", count: leads.filter((l) => l.status === "proposal").length },
    { stage: "Negotiation", count: leads.filter((l) => l.status === "negotiation").length },
    { stage: "Closed Won", count: leads.filter((l) => l.status === "closed-won").length },
  ]

  // Product performance data
  const productPerformanceData = customerProducts
    .reduce((acc, cp) => {
      const existing = acc.find((item) => item.name === cp.productName)
      if (existing) {
        existing.revenue += cp.amount || 0
        existing.customers += 1
      } else {
        acc.push({
          name: cp.productName?.length > 15 ? cp.productName.substring(0, 15) + "..." : cp.productName || "Unknown",
          revenue: cp.amount || 0,
          customers: 1,
        })
      }
      return acc
    }, [] as any[])
    .slice(0, 6)

  const generateReport = () => {
    const reportData = {
      generatedDate: new Date().toISOString(),
      summary: {
        totalCustomers,
        activeCustomers,
        totalLeads,
        qualifiedLeads,
        closedWonLeads,
        totalRevenue,
        revenueGrowth,
        completedTasks,
        completedMeetings,
      },
      charts: {
        revenueTargets,
        customerValueData,
        leadFunnelData,
        productPerformanceData,
      },
      details: {
        customers: customers.map((c) => ({
          name: c.name,
          email: c.email,
          company: c.company,
          status: c.status,
          value: c.value,
          lastContact: c.lastContact,
        })),
        leads: leads.map((l) => ({
          name: l.name,
          email: l.email,
          company: l.company,
          status: l.status,
          amount: l.amount,
          source: l.source,
        })),
        customerProducts: customerProducts.map((cp) => ({
          customerName: cp.customerName,
          productName: cp.productName,
          category: cp.category,
          amount: cp.amount,
          status: cp.status,
          purchaseDate: cp.purchaseDate,
        })),
      },
    }

    // Convert to CSV format
    const csvContent = [
      "THYNKWEALTH CRM - Comprehensive Report",
      `Generated on: ${new Date().toLocaleDateString()}`,
      "",
      "EXECUTIVE SUMMARY",
      `Total Customers,${totalCustomers}`,
      `Active Customers,${activeCustomers}`,
      `Total Leads,${totalLeads}`,
      `Qualified Leads,${qualifiedLeads}`,
      `Closed Won Leads,${closedWonLeads}`,
      `Total Revenue,₹${totalRevenue.toLocaleString()}`,
      `Revenue Growth,${revenueGrowth.toFixed(2)}%`,
      `Completed Tasks,${completedTasks}`,
      `Completed Meetings,${completedMeetings}`,
      "",
      "REVENUE TARGETS VS ACTUAL",
      "Month,Target,Actual,Variance",
      ...revenueTargets.map(
        (rt) =>
          `${rt.month},₹${rt.target.toLocaleString()},₹${rt.actual.toLocaleString()},₹${(rt.actual - rt.target).toLocaleString()}`,
      ),
      "",
      "CUSTOMER VALUE DISTRIBUTION",
      "Category,Count",
      ...customerValueData.map((cvd) => `${cvd.name},${cvd.value}`),
      "",
      "LEAD CONVERSION FUNNEL",
      "Stage,Count",
      ...leadFunnelData.map((lfd) => `${lfd.stage},${lfd.count}`),
      "",
      "PRODUCT PERFORMANCE",
      "Product,Revenue,Active Customers",
      ...productPerformanceData.map((ppd) => `${ppd.name},₹${ppd.revenue.toLocaleString()},${ppd.customers}`),
      "",
      "CUSTOMER PRODUCTS",
      "Customer,Product,Category,Amount,Status,Purchase Date",
      ...customerProducts.map(
        (cp) =>
          `${cp.customerName},${cp.productName},${cp.category},₹${cp.amount?.toLocaleString() || 0},${cp.status},${cp.purchaseDate}`,
      ),
    ].join("\n")

    // Download the report
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `THYNKWEALTH-Report-${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#004360]">Reports & Analytics</h1>
          <div className="flex gap-2">
            <Button onClick={generateReport} className="bg-[#008dd2] hover:bg-[#006ba6] text-white">
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="revenue">Revenue</TabsTrigger>
            <TabsTrigger value="customers">Customers</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-l-4 border-l-[#008dd2]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Customers</p>
                      <p className="text-2xl font-bold text-[#008dd2]">{totalCustomers}</p>
                      <p className="text-xs text-gray-500">{activeCustomers} active</p>
                    </div>
                    <Users className="h-8 w-8 text-[#008dd2] opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-[#ef7f1a]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                      <p className="text-2xl font-bold text-[#ef7f1a]">₹{totalRevenue.toLocaleString()}</p>
                      <div className="flex items-center gap-1">
                        {revenueGrowth >= 0 ? (
                          <TrendingUp className="h-3 w-3 text-green-500" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-500" />
                        )}
                        <p className={`text-xs ${revenueGrowth >= 0 ? "text-green-500" : "text-red-500"}`}>
                          {revenueGrowth.toFixed(1)}%
                        </p>
                      </div>
                    </div>
                    <DollarSign className="h-8 w-8 text-[#ef7f1a] opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-[#d7af00]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Qualified Leads</p>
                      <p className="text-2xl font-bold text-[#d7af00]">{qualifiedLeads}</p>
                      <p className="text-xs text-gray-500">{closedWonLeads} closed won</p>
                    </div>
                    <Target className="h-8 w-8 text-[#d7af00] opacity-80" />
                  </div>
                </CardContent>
              </Card>

              <Card className="border-l-4 border-l-[#fecc00]">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Task Completion</p>
                      <p className="text-2xl font-bold text-[#fecc00]">
                        {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                      </p>
                      <p className="text-xs text-gray-500">
                        {completedTasks}/{totalTasks} tasks
                      </p>
                    </div>
                    <Calendar className="h-8 w-8 text-[#fecc00] opacity-80" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Revenue Targets Chart */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg text-[#004360]">Revenue Targets vs Actual</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingTarget(revenueTargets[0])
                        setIsEditTargetOpen(true)
                      }}
                      className="text-[#004360] hover:bg-gray-100 p-1"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={revenueTargets.slice(0, 6)}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, ""]} />
                        <Area
                          type="monotone"
                          dataKey="target"
                          stackId="1"
                          stroke="#008dd2"
                          fill="#008dd2"
                          fillOpacity={0.3}
                        />
                        <Area
                          type="monotone"
                          dataKey="actual"
                          stackId="2"
                          stroke="#ef7f1a"
                          fill="#ef7f1a"
                          fillOpacity={0.6}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Value Distribution */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg text-[#004360]">Customer Value Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={customerValueData}
                          cx="50%"
                          cy="50%"
                          outerRadius={60}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, value }) => `${name}: ${value}`}
                          labelLine={false}
                        >
                          {customerValueData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="revenue" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Revenue Targets */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-[#004360]">Monthly Revenue Targets</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditingTarget(revenueTargets[0])
                        setIsEditTargetOpen(true)
                      }}
                      className="text-[#004360] hover:bg-gray-100"
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={revenueTargets}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, ""]} />
                        <Bar dataKey="target" fill="#008dd2" name="Target" />
                        <Bar dataKey="actual" fill="#ef7f1a" name="Actual" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Performance Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#004360]">Revenue Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-[#008dd2]/10 rounded-lg">
                      <p className="text-sm text-gray-600">Total Target</p>
                      <p className="text-xl font-bold text-[#008dd2]">₹{totalTargets.toLocaleString()}</p>
                    </div>
                    <div className="text-center p-3 bg-[#ef7f1a]/10 rounded-lg">
                      <p className="text-sm text-gray-600">Total Actual</p>
                      <p className="text-xl font-bold text-[#ef7f1a]">₹{totalRevenue.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    {revenueTargets.slice(0, 6).map((target) => {
                      const variance = target.actual - target.target
                      const percentage = target.target > 0 ? (target.actual / target.target) * 100 : 0
                      return (
                        <div key={target.month} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm font-medium">{target.month}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-sm">₹{target.actual.toLocaleString()}</span>
                            <Badge className={variance >= 0 ? "bg-green-500 text-white" : "bg-red-500 text-white"}>
                              {percentage.toFixed(0)}%
                            </Badge>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="customers" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Lead Conversion Funnel */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#004360]">Lead Conversion Funnel</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={leadFunnelData} layout="horizontal">
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" tick={{ fontSize: 10 }} />
                        <YAxis dataKey="stage" type="category" tick={{ fontSize: 10 }} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#008dd2" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Customer Status Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#004360]">Customer Status Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      status: "active",
                      count: customers.filter((c) => c.status === "active").length,
                      color: "#d7af00",
                    },
                    {
                      status: "client",
                      count: customers.filter((c) => c.status === "client").length,
                      color: "#ef7f1a",
                    },
                    {
                      status: "prospect",
                      count: customers.filter((c) => c.status === "prospect").length,
                      color: "#008dd2",
                    },
                    {
                      status: "inactive",
                      count: customers.filter((c) => c.status === "inactive").length,
                      color: "#6b7280",
                    },
                  ].map((item) => (
                    <div key={item.status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="font-medium capitalize">{item.status}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-bold" style={{ color: item.color }}>
                          {item.count}
                        </span>
                        <p className="text-xs text-gray-500">
                          {totalCustomers > 0 ? Math.round((item.count / totalCustomers) * 100) : 0}%
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Product Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#004360]">Top Product Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={productPerformanceData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                        <YAxis tick={{ fontSize: 10 }} />
                        <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString()}`, "Revenue"]} />
                        <Bar dataKey="revenue" fill="#ef7f1a" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Activity Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#004360]">Activity Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-[#008dd2]/10 rounded-lg">
                      <p className="text-sm text-gray-600">Total Tasks</p>
                      <p className="text-2xl font-bold text-[#008dd2]">{totalTasks}</p>
                      <p className="text-xs text-gray-500">{completedTasks} completed</p>
                    </div>
                    <div className="text-center p-3 bg-[#ef7f1a]/10 rounded-lg">
                      <p className="text-sm text-gray-600">Total Meetings</p>
                      <p className="text-2xl font-bold text-[#ef7f1a]">{totalMeetings}</p>
                      <p className="text-xs text-gray-500">{completedMeetings} completed</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Task Completion Rate</span>
                      <div className="text-right">
                        <span className="text-lg font-bold text-[#d7af00]">
                          {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Meeting Completion Rate</span>
                      <div className="text-right">
                        <span className="text-lg font-bold text-[#fecc00]">
                          {totalMeetings > 0 ? Math.round((completedMeetings / totalMeetings) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">Lead Conversion Rate</span>
                      <div className="text-right">
                        <span className="text-lg font-bold text-[#008dd2]">
                          {totalLeads > 0 ? Math.round((closedWonLeads / totalLeads) * 100) : 0}%
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* Edit Revenue Target Modal */}
        <Dialog open={isEditTargetOpen} onOpenChange={setIsEditTargetOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-[#004360]">Edit Revenue Targets</DialogTitle>
              <DialogDescription>Update monthly revenue targets and actual values.</DialogDescription>
            </DialogHeader>
            {editingTarget && (
              <div className="space-y-4">
                <div>
                  <Label className="text-[#004360]">Month</Label>
                  <Input value={editingTarget.month} className="border-[#004360] bg-gray-50" disabled />
                </div>
                <div>
                  <Label htmlFor="editTarget" className="text-[#004360]">
                    Target (₹)
                  </Label>
                  <Input
                    id="editTarget"
                    type="number"
                    value={editingTarget.target}
                    onChange={(e) =>
                      setEditingTarget({ ...editingTarget, target: Number.parseFloat(e.target.value) || 0 })
                    }
                    className="border-[#004360]"
                  />
                </div>
                <div>
                  <Label htmlFor="editActual" className="text-[#004360]">
                    Actual (₹)
                  </Label>
                  <Input
                    id="editActual"
                    type="number"
                    value={editingTarget.actual}
                    onChange={(e) =>
                      setEditingTarget({ ...editingTarget, actual: Number.parseFloat(e.target.value) || 0 })
                    }
                    className="border-[#004360]"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button onClick={updateTarget} className="flex-1 bg-[#d7af00] text-white">
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditTargetOpen(false)
                      setEditingTarget(null)
                    }}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  )
}
