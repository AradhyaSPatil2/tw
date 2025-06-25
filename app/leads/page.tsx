"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Filter, Search, Phone, Mail, Building, Calendar, User, DollarSign, Target, Edit } from "lucide-react"
import Layout from "@/components/layout"
import ExportButton from "@/components/export-button"
import MeetingModal from "@/components/meeting-modal"

interface Lead {
  id: string
  name: string
  email: string
  phone: string
  company: string
  source: string
  status: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "closed-won" | "closed-lost"
  amount: number
  assignedTo: string
  createdDate: string
  lastActivity: string
  notes: string
  activities: Activity[]
  qualificationCriteria: QualificationCriteria
}

interface Activity {
  id: string
  type: "call" | "email" | "meeting" | "note" | "task"
  description: string
  date: string
  outcome: string
}

interface QualificationCriteria {
  budget: "unknown" | "low" | "medium" | "high"
  authority: "unknown" | "influencer" | "decision-maker"
  need: "unknown" | "low" | "medium" | "high"
  timeline: "unknown" | "immediate" | "1-3 months" | "3-6 months" | "6+ months"
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [filteredLeads, setFilteredLeads] = useState<Lead[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false)
  const [isEditingLead, setIsEditingLead] = useState(false)
  const [isLogCallOpen, setIsLogCallOpen] = useState(false)
  const [isLogEmailOpen, setIsLogEmailOpen] = useState(false)
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false)
  const [editingLead, setEditingLead] = useState<Partial<Lead>>({})
  const [newLead, setNewLead] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    source: "",
    amount: "",
    notes: "",
  })
  const [newActivity, setNewActivity] = useState({
    description: "",
    outcome: "",
  })

  useEffect(() => {
    const savedLeads = localStorage.getItem("leads")
    if (savedLeads) {
      const parsedLeads = JSON.parse(savedLeads)
      setLeads(parsedLeads)
      setFilteredLeads(parsedLeads)
    }
  }, [])

  useEffect(() => {
    let filtered = leads.filter(
      (lead) =>
        lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        lead.company.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (statusFilter !== "all") {
      filtered = filtered.filter((lead) => lead.status === statusFilter)
    }

    setFilteredLeads(filtered)
  }, [leads, searchTerm, statusFilter])

  const saveLeads = (updatedLeads: Lead[]) => {
    setLeads(updatedLeads)
    localStorage.setItem("leads", JSON.stringify(updatedLeads))
  }

  const addLead = () => {
    if (newLead.name && newLead.email) {
      const lead: Lead = {
        id: Date.now().toString(),
        ...newLead,
        amount: Number.parseFloat(newLead.amount) || 0,
        status: "new",
        assignedTo: localStorage.getItem("username") || "Unassigned",
        createdDate: new Date().toISOString().split("T")[0],
        lastActivity: new Date().toISOString().split("T")[0],
        activities: [],
        qualificationCriteria: {
          budget: "unknown",
          authority: "unknown",
          need: "unknown",
          timeline: "unknown",
        },
      }

      const updatedLeads = [...leads, lead]
      saveLeads(updatedLeads)

      setNewLead({
        name: "",
        email: "",
        phone: "",
        company: "",
        source: "",
        amount: "",
        notes: "",
      })
      setIsAddLeadOpen(false)
    }
  }

  const updateLead = () => {
    if (selectedLead && editingLead) {
      const updatedLeads = leads.map((lead) =>
        lead.id === selectedLead.id
          ? { ...lead, ...editingLead, lastActivity: new Date().toISOString().split("T")[0] }
          : lead,
      )
      saveLeads(updatedLeads)
      setSelectedLead({ ...selectedLead, ...editingLead })
      setIsEditingLead(false)
      setEditingLead({})
    }
  }

  const updateLeadStatus = (leadId: string, newStatus: Lead["status"]) => {
    const updatedLeads = leads.map((lead) => {
      if (lead.id === leadId) {
        return {
          ...lead,
          status: newStatus,
          lastActivity: new Date().toISOString().split("T")[0],
        }
      }
      return lead
    })
    saveLeads(updatedLeads)

    if (selectedLead?.id === leadId) {
      setSelectedLead(updatedLeads.find((lead) => lead.id === leadId) || null)
    }
  }

  const addActivity = (type: Activity["type"]) => {
    if (selectedLead && newActivity.description) {
      const activity: Activity = {
        id: Date.now().toString(),
        type,
        description: newActivity.description,
        outcome: newActivity.outcome,
        date: new Date().toISOString().split("T")[0],
      }

      const updatedLeads = leads.map((lead) => {
        if (lead.id === selectedLead.id) {
          return {
            ...lead,
            activities: [...lead.activities, activity],
            lastActivity: new Date().toISOString().split("T")[0],
          }
        }
        return lead
      })

      saveLeads(updatedLeads)
      setSelectedLead({
        ...selectedLead,
        activities: [...selectedLead.activities, activity],
        lastActivity: new Date().toISOString().split("T")[0],
      })

      setNewActivity({ description: "", outcome: "" })
      setIsLogCallOpen(false)
      setIsLogEmailOpen(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-[#008dd2] text-white"
      case "contacted":
        return "bg-[#fecc00] text-black"
      case "qualified":
        return "bg-[#d7af00] text-white"
      case "proposal":
        return "bg-[#ef7f1a] text-white"
      case "negotiation":
        return "bg-purple-500 text-white"
      case "closed-won":
        return "bg-green-500 text-white"
      case "closed-lost":
        return "bg-red-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getStatusLabel = (status: string) => {
    return status
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const getPriorityColor = (amount: number) => {
    if (amount >= 100000) return "text-[#d7af00]"
    if (amount >= 50000) return "text-[#ef7f1a]"
    return "text-[#008dd2]"
  }

  // Export headers for leads
  const leadExportHeaders = [
    "name",
    "email",
    "phone",
    "company",
    "source",
    "status",
    "amount",
    "assignedTo",
    "createdDate",
    "lastActivity",
    "notes",
  ]

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#004360]">Lead Management</h1>
          <div className="flex gap-2">
            <ExportButton data={leads} filename="leads" headers={leadExportHeaders} />
            <Dialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#ef7f1a] hover:bg-[#d16a0f] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Lead
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-[#004360]">Add New Lead</DialogTitle>
                  <DialogDescription>
                    Enter lead information to start tracking this potential customer.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="leadName" className="text-[#004360]">
                      Name *
                    </Label>
                    <Input
                      id="leadName"
                      value={newLead.name}
                      onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                      placeholder="Lead name"
                      className="border-[#004360] focus:border-[#008dd2]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="leadEmail" className="text-[#004360]">
                      Email *
                    </Label>
                    <Input
                      id="leadEmail"
                      type="email"
                      value={newLead.email}
                      onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                      placeholder="lead@example.com"
                      className="border-[#004360] focus:border-[#008dd2]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="leadPhone" className="text-[#004360]">
                      Phone
                    </Label>
                    <Input
                      id="leadPhone"
                      value={newLead.phone}
                      onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                      placeholder="Phone number"
                      className="border-[#004360] focus:border-[#008dd2]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="leadCompany" className="text-[#004360]">
                      Company
                    </Label>
                    <Input
                      id="leadCompany"
                      value={newLead.company}
                      onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                      placeholder="Company name"
                      className="border-[#004360] focus:border-[#008dd2]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="leadSource" className="text-[#004360]">
                      Lead Source
                    </Label>
                    <Select value={newLead.source} onValueChange={(value) => setNewLead({ ...newLead, source: value })}>
                      <SelectTrigger className="border-[#004360] focus:border-[#008dd2]">
                        <SelectValue placeholder="Select source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="referral">Referral</SelectItem>
                        <SelectItem value="social-media">Social Media</SelectItem>
                        <SelectItem value="email-campaign">Email Campaign</SelectItem>
                        <SelectItem value="cold-call">Cold Call</SelectItem>
                        <SelectItem value="trade-show">Trade Show</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="leadAmount" className="text-[#004360]">
                      Potential Value ($)
                    </Label>
                    <Input
                      id="leadAmount"
                      type="number"
                      value={newLead.amount}
                      onChange={(e) => setNewLead({ ...newLead, amount: e.target.value })}
                      placeholder="0"
                      className="border-[#004360] focus:border-[#008dd2]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="leadNotes" className="text-[#004360]">
                      Notes
                    </Label>
                    <Textarea
                      id="leadNotes"
                      value={newLead.notes}
                      onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                      placeholder="Additional notes about this lead"
                      className="border-[#004360] focus:border-[#008dd2]"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={addLead}
                      className="flex-1 bg-[#ef7f1a] hover:bg-[#d16a0f] text-white"
                      disabled={!newLead.name || !newLead.email}
                    >
                      Add Lead
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddLeadOpen(false)}
                      className="flex-1 border-[#004360] text-[#004360]"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-[#008dd2] focus:border-[#004360]"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48 border-[#008dd2] focus:border-[#004360]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="proposal">Proposal</SelectItem>
              <SelectItem value="negotiation">Negotiation</SelectItem>
              <SelectItem value="closed-won">Closed Won</SelectItem>
              <SelectItem value="closed-lost">Closed Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Lead List - Reduced Size */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#004360] flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Leads ({filteredLeads.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {filteredLeads.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <Target className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No leads found</p>
                    </div>
                  ) : (
                    filteredLeads.map((lead) => (
                      <div
                        key={lead.id}
                        className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedLead?.id === lead.id ? "bg-blue-50 border-l-4 border-l-[#008dd2]" : ""
                        }`}
                        onClick={() => setSelectedLead(lead)}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="font-medium text-[#004360]">{lead.name}</h4>
                            <p className="text-sm text-gray-600">{lead.email}</p>
                            <p className="text-sm text-gray-500">{lead.company}</p>
                          </div>
                          <div className="text-right">
                            <Badge className={getStatusColor(lead.status)}>{getStatusLabel(lead.status)}</Badge>
                            <p className={`text-sm font-medium mt-1 ${getPriorityColor(lead.amount)}`}>
                              ${lead.amount.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex justify-between items-center text-xs text-gray-500">
                          <span>Source: {lead.source}</span>
                          <span>Last activity: {lead.lastActivity}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lead Details - Expanded Horizontal Layout */}
          <div className="lg:col-span-3">
            {selectedLead ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-[#004360] rounded-full flex items-center justify-center text-white font-bold">
                        {selectedLead.name.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-[#004360]">{selectedLead.name}</CardTitle>
                        <CardDescription>{selectedLead.company}</CardDescription>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setIsEditingLead(true)
                        setEditingLead({
                          name: selectedLead.name,
                          email: selectedLead.email,
                          phone: selectedLead.phone,
                          company: selectedLead.company,
                          amount: selectedLead.amount,
                          notes: selectedLead.notes,
                        })
                      }}
                      className="text-[#004360] hover:bg-gray-100"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditingLead ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-[#004360]">Name</Label>
                          <Input
                            value={editingLead.name || ""}
                            onChange={(e) => setEditingLead({ ...editingLead, name: e.target.value })}
                            className="border-[#004360]"
                          />
                        </div>
                        <div>
                          <Label className="text-[#004360]">Email</Label>
                          <Input
                            value={editingLead.email || ""}
                            onChange={(e) => setEditingLead({ ...editingLead, email: e.target.value })}
                            className="border-[#004360]"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-[#004360]">Phone</Label>
                          <Input
                            value={editingLead.phone || ""}
                            onChange={(e) => setEditingLead({ ...editingLead, phone: e.target.value })}
                            className="border-[#004360]"
                          />
                        </div>
                        <div>
                          <Label className="text-[#004360]">Company</Label>
                          <Input
                            value={editingLead.company || ""}
                            onChange={(e) => setEditingLead({ ...editingLead, company: e.target.value })}
                            className="border-[#004360]"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-[#004360]">Potential Value ($)</Label>
                        <Input
                          type="number"
                          value={editingLead.amount || ""}
                          onChange={(e) =>
                            setEditingLead({ ...editingLead, amount: Number.parseFloat(e.target.value) || 0 })
                          }
                          className="border-[#004360]"
                        />
                      </div>
                      <div>
                        <Label className="text-[#004360]">Notes</Label>
                        <Textarea
                          value={editingLead.notes || ""}
                          onChange={(e) => setEditingLead({ ...editingLead, notes: e.target.value })}
                          className="border-[#004360]"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={updateLead} className="flex-1 bg-[#d7af00] text-white">
                          Save Changes
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setIsEditingLead(false)
                            setEditingLead({})
                          }}
                          className="flex-1"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Contact Information */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-[#008dd2]" />
                            <span>{selectedLead.email}</span>
                          </div>
                          {selectedLead.phone && (
                            <div className="flex items-center gap-2 text-sm">
                              <Phone className="h-4 w-4 text-[#008dd2]" />
                              <span>{selectedLead.phone}</span>
                            </div>
                          )}
                          {selectedLead.company && (
                            <div className="flex items-center gap-2 text-sm">
                              <Building className="h-4 w-4 text-[#008dd2]" />
                              <span>{selectedLead.company}</span>
                            </div>
                          )}
                        </div>

                        {/* Lead Value */}
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center gap-2 mb-1">
                            <DollarSign className="h-4 w-4 text-[#d7af00]" />
                            <span className="text-sm font-medium text-gray-600">Potential Value</span>
                          </div>
                          <p className={`text-xl font-bold ${getPriorityColor(selectedLead.amount)}`}>
                            ${selectedLead.amount.toLocaleString()}
                          </p>
                        </div>
                      </div>

                      {/* Status Management */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-[#004360] mb-2 block">Lead Status</Label>
                          <Select
                            value={selectedLead.status}
                            onValueChange={(value) => updateLeadStatus(selectedLead.id, value as Lead["status"])}
                          >
                            <SelectTrigger className="border-[#004360] focus:border-[#008dd2]">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="contacted">Contacted</SelectItem>
                              <SelectItem value="qualified">Qualified</SelectItem>
                              <SelectItem value="proposal">Proposal</SelectItem>
                              <SelectItem value="negotiation">Negotiation</SelectItem>
                              <SelectItem value="closed-won">Closed Won</SelectItem>
                              <SelectItem value="closed-lost">Closed Lost</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Assigned To */}
                        <div>
                          <Label className="text-[#004360] mb-2 block">Assigned To</Label>
                          <div className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                            <User className="h-4 w-4 text-[#008dd2]" />
                            <span className="text-sm">{selectedLead.assignedTo}</span>
                          </div>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                        <Dialog open={isLogCallOpen} onOpenChange={setIsLogCallOpen}>
                          <DialogTrigger asChild>
                            <Button size="sm" className="bg-[#ef7f1a] hover:bg-[#d16a0f] text-white">
                              <Phone className="h-4 w-4 mr-2" />
                              Log Call
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle className="text-[#004360]">Log Call Activity</DialogTitle>
                              <DialogDescription>
                                Record details about your call with {selectedLead.name}.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="callDescription" className="text-[#004360]">
                                  Call Description *
                                </Label>
                                <Textarea
                                  id="callDescription"
                                  value={newActivity.description}
                                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                                  placeholder="Describe the call conversation"
                                  className="border-[#004360]"
                                />
                              </div>
                              <div>
                                <Label htmlFor="callOutcome" className="text-[#004360]">
                                  Call Outcome
                                </Label>
                                <Input
                                  id="callOutcome"
                                  value={newActivity.outcome}
                                  onChange={(e) => setNewActivity({ ...newActivity, outcome: e.target.value })}
                                  placeholder="Call outcome or next steps"
                                  className="border-[#004360]"
                                />
                              </div>
                              <div className="flex gap-2 pt-4">
                                <Button
                                  onClick={() => addActivity("call")}
                                  className="flex-1 bg-[#ef7f1a] hover:bg-[#d16a0f] text-white"
                                  disabled={!newActivity.description}
                                >
                                  Log Call
                                </Button>
                                <Button variant="outline" onClick={() => setIsLogCallOpen(false)} className="flex-1">
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Dialog open={isLogEmailOpen} onOpenChange={setIsLogEmailOpen}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="border-[#008dd2] text-[#008dd2] hover:bg-[#008dd2] hover:text-white"
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Log Email
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-md">
                            <DialogHeader>
                              <DialogTitle className="text-[#004360]">Log Email Activity</DialogTitle>
                              <DialogDescription>
                                Record details about your email with {selectedLead.name}.
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <Label htmlFor="emailDescription" className="text-[#004360]">
                                  Email Summary *
                                </Label>
                                <Textarea
                                  id="emailDescription"
                                  value={newActivity.description}
                                  onChange={(e) => setNewActivity({ ...newActivity, description: e.target.value })}
                                  placeholder="Summarize the email content"
                                  className="border-[#004360]"
                                />
                              </div>
                              <div>
                                <Label htmlFor="emailOutcome" className="text-[#004360]">
                                  Email Status
                                </Label>
                                <Select
                                  value={newActivity.outcome}
                                  onValueChange={(value) => setNewActivity({ ...newActivity, outcome: value })}
                                >
                                  <SelectTrigger className="border-[#004360]">
                                    <SelectValue placeholder="Select status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="sent">Sent</SelectItem>
                                    <SelectItem value="replied">Replied</SelectItem>
                                    <SelectItem value="bounced">Bounced</SelectItem>
                                    <SelectItem value="opened">Opened</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="flex gap-2 pt-4">
                                <Button
                                  onClick={() => addActivity("email")}
                                  className="flex-1 bg-[#008dd2] hover:bg-[#006ba6] text-white"
                                  disabled={!newActivity.description}
                                >
                                  Log Email
                                </Button>
                                <Button variant="outline" onClick={() => setIsLogEmailOpen(false)} className="flex-1">
                                  Cancel
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>

                        <Button
                          size="sm"
                          variant="outline"
                          className="border-[#d7af00] text-[#d7af00] hover:bg-[#d7af00] hover:text-white"
                          onClick={() => setIsMeetingModalOpen(true)}
                        >
                          <Calendar className="h-4 w-4 mr-2" />
                          Schedule Meeting
                        </Button>
                      </div>

                      {/* Recent Activities */}
                      <div>
                        <Label className="text-[#004360] mb-2 block">Recent Activities</Label>
                        <div className="max-h-32 overflow-y-auto space-y-2">
                          {selectedLead.activities.length === 0 ? (
                            <p className="text-sm text-gray-500 p-3 bg-gray-50 rounded">No activities recorded</p>
                          ) : (
                            selectedLead.activities
                              .slice(-5)
                              .reverse()
                              .map((activity) => (
                                <div key={activity.id} className="p-3 bg-gray-50 rounded-lg">
                                  <div className="flex items-center justify-between mb-1">
                                    <Badge variant="outline" className="capitalize">
                                      {activity.type}
                                    </Badge>
                                    <span className="text-xs text-gray-500">{activity.date}</span>
                                  </div>
                                  <p className="text-sm text-gray-700">{activity.description}</p>
                                  {activity.outcome && (
                                    <p className="text-xs text-gray-500 mt-1">Outcome: {activity.outcome}</p>
                                  )}
                                </div>
                              ))
                          )}
                        </div>
                      </div>

                      {/* Lead Notes */}
                      <div>
                        <Label className="text-[#004360] mb-2 block">Notes</Label>
                        <Textarea
                          value={selectedLead.notes}
                          onChange={(e) => {
                            const updatedLeads = leads.map((lead) =>
                              lead.id === selectedLead.id ? { ...lead, notes: e.target.value } : lead,
                            )
                            saveLeads(updatedLeads)
                            setSelectedLead({ ...selectedLead, notes: e.target.value })
                          }}
                          placeholder="Add notes about this lead..."
                          className="min-h-20 border-[#004360] focus:border-[#008dd2]"
                        />
                      </div>

                      {/* Lead Info */}
                      <div className="pt-4 border-t">
                        <div className="text-xs text-gray-500 space-y-1">
                          <p>Created: {selectedLead.createdDate}</p>
                          <p>Last activity: {selectedLead.lastActivity}</p>
                          <p>Source: {selectedLead.source}</p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center text-gray-500">
                    <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Select a Lead</h3>
                    <p>Choose a lead from the list to view details and manage information</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Meeting Modal */}
        <MeetingModal
          isOpen={isMeetingModalOpen}
          onClose={() => setIsMeetingModalOpen(false)}
          selectedLead={selectedLead}
        />
      </div>
    </Layout>
  )
}
