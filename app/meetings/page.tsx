"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Plus, Calendar, Clock, Users, MapPin, Search, Filter, Edit, Video, Phone } from "lucide-react"
import Layout from "@/components/layout"
import ExportButton from "@/components/export-button"

interface Meeting {
  id: string
  title: string
  description: string
  date: string
  time: string
  duration: number
  type: "client" | "internal" | "prospect"
  attendees: string[]
  location: string
  status: "scheduled" | "completed" | "cancelled" | "rescheduled"
  createdBy: string
  createdDate: string
  notes: string
  linkedTo?: {
    type: "customer" | "lead"
    id: string
    name: string
  }
}

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [isAddMeetingOpen, setIsAddMeetingOpen] = useState(false)
  const [isEditMeetingOpen, setIsEditMeetingOpen] = useState(false)
  const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null)
  const [newMeeting, setNewMeeting] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    duration: 60,
    type: "client" as Meeting["type"],
    attendees: "",
    location: "",
    notes: "",
  })

  useEffect(() => {
    const savedMeetings = localStorage.getItem("meetings")
    if (savedMeetings) {
      const parsedMeetings = JSON.parse(savedMeetings)
      setMeetings(parsedMeetings)
      setFilteredMeetings(parsedMeetings)
    }
  }, [])

  useEffect(() => {
    let filtered = meetings.filter(
      (meeting) =>
        meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        meeting.attendees.some((attendee) => attendee.toLowerCase().includes(searchTerm.toLowerCase())),
    )

    if (statusFilter !== "all") {
      filtered = filtered.filter((meeting) => meeting.status === statusFilter)
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter((meeting) => meeting.type === typeFilter)
    }

    setFilteredMeetings(filtered)
  }, [meetings, searchTerm, statusFilter, typeFilter])

  const saveMeetings = (updatedMeetings: Meeting[]) => {
    setMeetings(updatedMeetings)
    localStorage.setItem("meetings", JSON.stringify(updatedMeetings))
  }

  const addMeeting = () => {
    if (newMeeting.title && newMeeting.date && newMeeting.time) {
      const meeting: Meeting = {
        id: Date.now().toString(),
        ...newMeeting,
        attendees: newMeeting.attendees
          .split(",")
          .map((a) => a.trim())
          .filter(Boolean),
        status: "scheduled",
        createdBy: localStorage.getItem("username") || "Unknown",
        createdDate: new Date().toISOString().split("T")[0],
      }

      const updatedMeetings = [...meetings, meeting]
      saveMeetings(updatedMeetings)

      setNewMeeting({
        title: "",
        description: "",
        date: "",
        time: "",
        duration: 60,
        type: "client",
        attendees: "",
        location: "",
        notes: "",
      })
      setIsAddMeetingOpen(false)
    }
  }

  const updateMeeting = () => {
    if (editingMeeting) {
      const updatedMeetings = meetings.map((meeting) => (meeting.id === editingMeeting.id ? editingMeeting : meeting))
      saveMeetings(updatedMeetings)
      setSelectedMeeting(editingMeeting)
      setIsEditMeetingOpen(false)
      setEditingMeeting(null)
    }
  }

  const updateMeetingStatus = (meetingId: string, newStatus: Meeting["status"]) => {
    const updatedMeetings = meetings.map((meeting) =>
      meeting.id === meetingId ? { ...meeting, status: newStatus } : meeting,
    )
    saveMeetings(updatedMeetings)

    if (selectedMeeting?.id === meetingId) {
      setSelectedMeeting({ ...selectedMeeting, status: newStatus })
    }
  }

  const deleteMeeting = (meetingId: string) => {
    const updatedMeetings = meetings.filter((meeting) => meeting.id !== meetingId)
    saveMeetings(updatedMeetings)
    if (selectedMeeting?.id === meetingId) {
      setSelectedMeeting(null)
    }
  }

  const openEditMeeting = (meeting: Meeting) => {
    setEditingMeeting({ ...meeting })
    setIsEditMeetingOpen(true)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-[#008dd2] text-white"
      case "completed":
        return "bg-[#d7af00] text-white"
      case "cancelled":
        return "bg-red-500 text-white"
      case "rescheduled":
        return "bg-[#fecc00] text-black"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "client":
        return "bg-[#ef7f1a] text-white"
      case "internal":
        return "bg-[#008dd2] text-white"
      case "prospect":
        return "bg-[#d7af00] text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const isPastMeeting = (date: string, time: string) => {
    const meetingDateTime = new Date(`${date}T${time}`)
    return meetingDateTime < new Date()
  }

  const todayMeetings = filteredMeetings.filter((meeting) => {
    const today = new Date().toISOString().split("T")[0]
    return meeting.date === today && meeting.status === "scheduled"
  })

  const upcomingMeetings = filteredMeetings.filter((meeting) => {
    const meetingDate = new Date(meeting.date)
    const today = new Date()
    const diffTime = meetingDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 && diffDays <= 7 && meeting.status === "scheduled"
  })

  // Export headers for meetings
  const meetingExportHeaders = [
    "title",
    "description",
    "date",
    "time",
    "duration",
    "type",
    "attendees",
    "location",
    "status",
    "createdBy",
    "createdDate",
    "notes",
  ]

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#004360]">Meetings</h1>
          <div className="flex gap-2">
            <ExportButton
              data={meetings.map((meeting) => ({
                ...meeting,
                attendees: meeting.attendees.join(", "),
              }))}
              filename="meetings"
              headers={meetingExportHeaders}
            />
            <Dialog open={isAddMeetingOpen} onOpenChange={setIsAddMeetingOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#ef7f1a] hover:bg-[#d16a0f] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Meeting
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-[#004360]">Schedule New Meeting</DialogTitle>
                  <DialogDescription>Create a new meeting and invite attendees.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="meetingTitle" className="text-[#004360]">
                      Meeting Title *
                    </Label>
                    <Input
                      id="meetingTitle"
                      value={newMeeting.title}
                      onChange={(e) => setNewMeeting({ ...newMeeting, title: e.target.value })}
                      placeholder="Enter meeting title"
                      className="border-[#004360] focus:border-[#008dd2]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="meetingDescription" className="text-[#004360]">
                      Description
                    </Label>
                    <Textarea
                      id="meetingDescription"
                      value={newMeeting.description}
                      onChange={(e) => setNewMeeting({ ...newMeeting, description: e.target.value })}
                      placeholder="Meeting description"
                      className="border-[#004360] focus:border-[#008dd2]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="meetingDate" className="text-[#004360]">
                        Date *
                      </Label>
                      <Input
                        id="meetingDate"
                        type="date"
                        value={newMeeting.date}
                        onChange={(e) => setNewMeeting({ ...newMeeting, date: e.target.value })}
                        className="border-[#004360] focus:border-[#008dd2]"
                      />
                    </div>
                    <div>
                      <Label htmlFor="meetingTime" className="text-[#004360]">
                        Time *
                      </Label>
                      <Input
                        id="meetingTime"
                        type="time"
                        value={newMeeting.time}
                        onChange={(e) => setNewMeeting({ ...newMeeting, time: e.target.value })}
                        className="border-[#004360] focus:border-[#008dd2]"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="meetingDuration" className="text-[#004360]">
                        Duration (minutes)
                      </Label>
                      <Input
                        id="meetingDuration"
                        type="number"
                        value={newMeeting.duration}
                        onChange={(e) =>
                          setNewMeeting({ ...newMeeting, duration: Number.parseInt(e.target.value) || 60 })
                        }
                        className="border-[#004360] focus:border-[#008dd2]"
                      />
                    </div>
                    <div>
                      <Label className="text-[#004360]">Meeting Type</Label>
                      <Select
                        value={newMeeting.type}
                        onValueChange={(value) => setNewMeeting({ ...newMeeting, type: value as Meeting["type"] })}
                      >
                        <SelectTrigger className="border-[#004360] focus:border-[#008dd2]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="client">Client Meeting</SelectItem>
                          <SelectItem value="internal">Internal Meeting</SelectItem>
                          <SelectItem value="prospect">Prospect Meeting</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="meetingAttendees" className="text-[#004360]">
                      Attendees (comma-separated)
                    </Label>
                    <Input
                      id="meetingAttendees"
                      value={newMeeting.attendees}
                      onChange={(e) => setNewMeeting({ ...newMeeting, attendees: e.target.value })}
                      placeholder="John Doe, Jane Smith, ..."
                      className="border-[#004360] focus:border-[#008dd2]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="meetingLocation" className="text-[#004360]">
                      Location
                    </Label>
                    <Input
                      id="meetingLocation"
                      value={newMeeting.location}
                      onChange={(e) => setNewMeeting({ ...newMeeting, location: e.target.value })}
                      placeholder="Meeting location or video link"
                      className="border-[#004360] focus:border-[#008dd2]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="meetingNotes" className="text-[#004360]">
                      Notes
                    </Label>
                    <Textarea
                      id="meetingNotes"
                      value={newMeeting.notes}
                      onChange={(e) => setNewMeeting({ ...newMeeting, notes: e.target.value })}
                      placeholder="Additional notes"
                      className="border-[#004360] focus:border-[#008dd2]"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={addMeeting}
                      className="flex-1 bg-[#ef7f1a] hover:bg-[#d16a0f] text-white"
                      disabled={!newMeeting.title || !newMeeting.date || !newMeeting.time}
                    >
                      Schedule Meeting
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddMeetingOpen(false)}
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

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#ef7f1a]" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Today</p>
                  <p className="text-2xl font-bold text-[#ef7f1a]">{todayMeetings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-[#008dd2]" />
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-[#008dd2]">{upcomingMeetings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-[#d7af00]" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Meetings</p>
                  <p className="text-2xl font-bold text-[#d7af00]">{meetings.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-green-500">
                    {meetings.filter((meeting) => meeting.status === "completed").length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search meetings..."
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
              <SelectItem value="scheduled">Scheduled</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
              <SelectItem value="rescheduled">Rescheduled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-full sm:w-48 border-[#008dd2] focus:border-[#004360]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="client">Client</SelectItem>
              <SelectItem value="internal">Internal</SelectItem>
              <SelectItem value="prospect">Prospect</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Meetings List */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#004360] flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Meetings ({filteredMeetings.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {filteredMeetings.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No meetings found</p>
                    </div>
                  ) : (
                    filteredMeetings
                      .sort(
                        (a, b) => new Date(`${a.date}T${a.time}`).getTime() - new Date(`${b.date}T${b.time}`).getTime(),
                      )
                      .map((meeting) => (
                        <div
                          key={meeting.id}
                          className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedMeeting?.id === meeting.id ? "bg-blue-50 border-l-4 border-l-[#008dd2]" : ""
                          } ${isPastMeeting(meeting.date, meeting.time) && meeting.status === "scheduled" ? "bg-red-50" : ""}`}
                          onClick={() => setSelectedMeeting(meeting)}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium text-[#004360]">{meeting.title}</h4>
                            <div className="flex gap-1">
                              <Badge className={getStatusColor(meeting.status)}>{meeting.status}</Badge>
                              <Badge className={getTypeColor(meeting.type)}>{meeting.type}</Badge>
                            </div>
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span>{meeting.date}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              <span>
                                {meeting.time} ({meeting.duration} min)
                              </span>
                            </div>
                            {meeting.attendees.length > 0 && (
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{meeting.attendees.length} attendees</span>
                              </div>
                            )}
                            {meeting.linkedTo && (
                              <div className="text-xs text-[#008dd2]">
                                Linked to: {meeting.linkedTo.name} ({meeting.linkedTo.type})
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Meeting Details */}
          <div className="lg:col-span-2">
            {selectedMeeting ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-[#004360]">{selectedMeeting.title}</CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={getStatusColor(selectedMeeting.status)}>{selectedMeeting.status}</Badge>
                        <Badge className={getTypeColor(selectedMeeting.type)}>{selectedMeeting.type}</Badge>
                        {isPastMeeting(selectedMeeting.date, selectedMeeting.time) &&
                          selectedMeeting.status === "scheduled" && (
                            <Badge className="bg-red-500 text-white">Overdue</Badge>
                          )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditMeeting(selectedMeeting)}
                        className="text-[#004360] hover:bg-gray-100"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Select
                        value={selectedMeeting.status}
                        onValueChange={(value) => updateMeetingStatus(selectedMeeting.id, value as Meeting["status"])}
                      >
                        <SelectTrigger className="w-32 border-[#004360]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                          <SelectItem value="rescheduled">Rescheduled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Meeting Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-[#008dd2]" />
                        <span className="font-medium">Date:</span>
                        <span>{selectedMeeting.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-[#008dd2]" />
                        <span className="font-medium">Time:</span>
                        <span>
                          {selectedMeeting.time} ({selectedMeeting.duration} minutes)
                        </span>
                      </div>
                      {selectedMeeting.location && (
                        <div className="flex items-center gap-2 text-sm">
                          {selectedMeeting.location.includes("http") ? (
                            <Video className="h-4 w-4 text-[#008dd2]" />
                          ) : selectedMeeting.location.includes("phone") ? (
                            <Phone className="h-4 w-4 text-[#008dd2]" />
                          ) : (
                            <MapPin className="h-4 w-4 text-[#008dd2]" />
                          )}
                          <span className="font-medium">Location:</span>
                          <span>{selectedMeeting.location}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-[#008dd2]" />
                        <span className="font-medium">Created by:</span>
                        <span>{selectedMeeting.createdBy}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-[#008dd2]" />
                        <span className="font-medium">Created:</span>
                        <span>{selectedMeeting.createdDate}</span>
                      </div>
                      {selectedMeeting.linkedTo && (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">Linked to:</span>
                          <Badge variant="outline" className="capitalize">
                            {selectedMeeting.linkedTo.type}: {selectedMeeting.linkedTo.name}
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  {selectedMeeting.description && (
                    <div>
                      <h4 className="font-medium text-[#004360] mb-2">Description</h4>
                      <p className="text-sm text-gray-600 p-3 bg-gray-50 rounded-lg">{selectedMeeting.description}</p>
                    </div>
                  )}

                  {/* Attendees */}
                  {selectedMeeting.attendees.length > 0 && (
                    <div>
                      <h4 className="font-medium text-[#004360] mb-2">Attendees</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedMeeting.attendees.map((attendee, index) => (
                          <Badge key={index} variant="outline" className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {attendee}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  <div>
                    <h4 className="font-medium text-[#004360] mb-2">Meeting Notes</h4>
                    <Textarea
                      value={selectedMeeting.notes}
                      onChange={(e) => {
                        const updatedMeetings = meetings.map((meeting) =>
                          meeting.id === selectedMeeting.id ? { ...meeting, notes: e.target.value } : meeting,
                        )
                        saveMeetings(updatedMeetings)
                        setSelectedMeeting({ ...selectedMeeting, notes: e.target.value })
                      }}
                      placeholder="Add meeting notes..."
                      className="min-h-24 border-[#004360] focus:border-[#008dd2]"
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 pt-4 border-t">
                    <Button
                      size="sm"
                      className="bg-[#008dd2] hover:bg-[#006ba6] text-white"
                      onClick={() => openEditMeeting(selectedMeeting)}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Edit Meeting
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-500 text-red-500 hover:bg-red-50"
                      onClick={() => deleteMeeting(selectedMeeting.id)}
                    >
                      Delete Meeting
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="flex items-center justify-center h-96">
                  <div className="text-center text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">Select a Meeting</h3>
                    <p>Choose a meeting from the list to view details and manage information</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Edit Meeting Modal */}
        <Dialog open={isEditMeetingOpen} onOpenChange={setIsEditMeetingOpen}>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#004360]">Edit Meeting</DialogTitle>
              <DialogDescription>Update meeting information and details.</DialogDescription>
            </DialogHeader>
            {editingMeeting && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editMeetingTitle" className="text-[#004360]">
                    Meeting Title *
                  </Label>
                  <Input
                    id="editMeetingTitle"
                    value={editingMeeting.title}
                    onChange={(e) => setEditingMeeting({ ...editingMeeting, title: e.target.value })}
                    placeholder="Enter meeting title"
                    className="border-[#004360] focus:border-[#008dd2]"
                  />
                </div>
                <div>
                  <Label htmlFor="editMeetingDescription" className="text-[#004360]">
                    Description
                  </Label>
                  <Textarea
                    id="editMeetingDescription"
                    value={editingMeeting.description}
                    onChange={(e) => setEditingMeeting({ ...editingMeeting, description: e.target.value })}
                    placeholder="Meeting description"
                    className="border-[#004360] focus:border-[#008dd2]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editMeetingDate" className="text-[#004360]">
                      Date *
                    </Label>
                    <Input
                      id="editMeetingDate"
                      type="date"
                      value={editingMeeting.date}
                      onChange={(e) => setEditingMeeting({ ...editingMeeting, date: e.target.value })}
                      className="border-[#004360] focus:border-[#008dd2]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="editMeetingTime" className="text-[#004360]">
                      Time *
                    </Label>
                    <Input
                      id="editMeetingTime"
                      type="time"
                      value={editingMeeting.time}
                      onChange={(e) => setEditingMeeting({ ...editingMeeting, time: e.target.value })}
                      className="border-[#004360] focus:border-[#008dd2]"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="editMeetingDuration" className="text-[#004360]">
                      Duration (minutes)
                    </Label>
                    <Input
                      id="editMeetingDuration"
                      type="number"
                      value={editingMeeting.duration}
                      onChange={(e) =>
                        setEditingMeeting({ ...editingMeeting, duration: Number.parseInt(e.target.value) || 60 })
                      }
                      className="border-[#004360] focus:border-[#008dd2]"
                    />
                  </div>
                  <div>
                    <Label className="text-[#004360]">Meeting Type</Label>
                    <Select
                      value={editingMeeting.type}
                      onValueChange={(value) =>
                        setEditingMeeting({ ...editingMeeting, type: value as Meeting["type"] })
                      }
                    >
                      <SelectTrigger className="border-[#004360] focus:border-[#008dd2]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="client">Client Meeting</SelectItem>
                        <SelectItem value="internal">Internal Meeting</SelectItem>
                        <SelectItem value="prospect">Prospect Meeting</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="editMeetingAttendees" className="text-[#004360]">
                    Attendees (comma-separated)
                  </Label>
                  <Input
                    id="editMeetingAttendees"
                    value={editingMeeting.attendees.join(", ")}
                    onChange={(e) =>
                      setEditingMeeting({
                        ...editingMeeting,
                        attendees: e.target.value
                          .split(",")
                          .map((a) => a.trim())
                          .filter(Boolean),
                      })
                    }
                    placeholder="John Doe, Jane Smith, ..."
                    className="border-[#004360] focus:border-[#008dd2]"
                  />
                </div>
                <div>
                  <Label htmlFor="editMeetingLocation" className="text-[#004360]">
                    Location
                  </Label>
                  <Input
                    id="editMeetingLocation"
                    value={editingMeeting.location}
                    onChange={(e) => setEditingMeeting({ ...editingMeeting, location: e.target.value })}
                    placeholder="Meeting location or video link"
                    className="border-[#004360] focus:border-[#008dd2]"
                  />
                </div>
                <div>
                  <Label className="text-[#004360]">Status</Label>
                  <Select
                    value={editingMeeting.status}
                    onValueChange={(value) =>
                      setEditingMeeting({ ...editingMeeting, status: value as Meeting["status"] })
                    }
                  >
                    <SelectTrigger className="border-[#004360] focus:border-[#008dd2]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                      <SelectItem value="rescheduled">Rescheduled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={updateMeeting}
                    className="flex-1 bg-[#d7af00] text-white"
                    disabled={!editingMeeting.title || !editingMeeting.date || !editingMeeting.time}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditMeetingOpen(false)
                      setEditingMeeting(null)
                    }}
                    className="flex-1 border-[#004360] text-[#004360]"
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
