"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface MeetingModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCustomer?: any
  selectedLead?: any
}

export default function MeetingModal({ isOpen, onClose, selectedCustomer, selectedLead }: MeetingModalProps) {
  const [meetingData, setMeetingData] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    duration: 60,
    type: "client" as "client" | "internal" | "prospect",
    location: "",
    notes: "",
  })

  useEffect(() => {
    if (selectedCustomer) {
      setMeetingData((prev) => ({
        ...prev,
        title: `Meeting with ${selectedCustomer.name}`,
        type: "client",
      }))
    } else if (selectedLead) {
      setMeetingData((prev) => ({
        ...prev,
        title: `Meeting with ${selectedLead.name}`,
        type: "prospect",
      }))
    }
  }, [selectedCustomer, selectedLead])

  const handleScheduleMeeting = () => {
    if (meetingData.title && meetingData.date && meetingData.time) {
      // Add to meetings
      const meetings = JSON.parse(localStorage.getItem("meetings") || "[]")
      const meeting = {
        id: Date.now().toString(),
        title: meetingData.title,
        description: meetingData.description,
        date: meetingData.date,
        time: meetingData.time,
        duration: meetingData.duration,
        type: meetingData.type,
        attendees: selectedCustomer ? [selectedCustomer.name] : selectedLead ? [selectedLead.name] : [],
        location: meetingData.location,
        status: "scheduled",
        createdBy: localStorage.getItem("username") || "Unknown",
        createdDate: new Date().toISOString().split("T")[0],
        notes: meetingData.notes,
        linkedTo: selectedCustomer
          ? {
              type: "customer",
              id: selectedCustomer.id,
              name: selectedCustomer.name,
            }
          : selectedLead
            ? {
                type: "lead",
                id: selectedLead.id,
                name: selectedLead.name,
              }
            : undefined,
      }
      meetings.push(meeting)
      localStorage.setItem("meetings", JSON.stringify(meetings))

      // Add to customer/lead interactions
      if (selectedCustomer) {
        const customers = JSON.parse(localStorage.getItem("customers") || "[]")
        const updatedCustomers = customers.map((customer: any) => {
          if (customer.id === selectedCustomer.id) {
            const interaction = {
              id: Date.now().toString(),
              type: "meeting",
              date: new Date().toISOString().split("T")[0],
              description: `Scheduled meeting: ${meetingData.title}`,
              outcome: "Scheduled",
            }
            return {
              ...customer,
              interactions: [...(customer.interactions || []), interaction],
              lastContact: new Date().toISOString().split("T")[0],
            }
          }
          return customer
        })
        localStorage.setItem("customers", JSON.stringify(updatedCustomers))
      }

      if (selectedLead) {
        const leads = JSON.parse(localStorage.getItem("leads") || "[]")
        const updatedLeads = leads.map((lead: any) => {
          if (lead.id === selectedLead.id) {
            const activity = {
              id: Date.now().toString(),
              type: "meeting",
              description: `Scheduled meeting: ${meetingData.title}`,
              date: new Date().toISOString().split("T")[0],
              outcome: "Scheduled",
            }
            return {
              ...lead,
              activities: [...(lead.activities || []), activity],
              lastActivity: new Date().toISOString().split("T")[0],
            }
          }
          return lead
        })
        localStorage.setItem("leads", JSON.stringify(updatedLeads))
      }

      // Reset form and close
      setMeetingData({
        title: "",
        description: "",
        date: "",
        time: "",
        duration: 60,
        type: "client",
        location: "",
        notes: "",
      })
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#004360]">Schedule Meeting</DialogTitle>
          <DialogDescription>
            {selectedCustomer && `Schedule a meeting with customer: ${selectedCustomer.name}`}
            {selectedLead && `Schedule a meeting with lead: ${selectedLead.name}`}
            {!selectedCustomer && !selectedLead && "Schedule a new meeting"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="meetingTitle" className="text-[#004360]">
              Meeting Title *
            </Label>
            <Input
              id="meetingTitle"
              value={meetingData.title}
              onChange={(e) => setMeetingData({ ...meetingData, title: e.target.value })}
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
              value={meetingData.description}
              onChange={(e) => setMeetingData({ ...meetingData, description: e.target.value })}
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
                value={meetingData.date}
                onChange={(e) => setMeetingData({ ...meetingData, date: e.target.value })}
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
                value={meetingData.time}
                onChange={(e) => setMeetingData({ ...meetingData, time: e.target.value })}
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
                value={meetingData.duration}
                onChange={(e) => setMeetingData({ ...meetingData, duration: Number.parseInt(e.target.value) || 60 })}
                className="border-[#004360] focus:border-[#008dd2]"
              />
            </div>
            <div>
              <Label className="text-[#004360]">Meeting Type</Label>
              <Select
                value={meetingData.type}
                onValueChange={(value) => setMeetingData({ ...meetingData, type: value as any })}
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
            <Label htmlFor="meetingLocation" className="text-[#004360]">
              Location
            </Label>
            <Input
              id="meetingLocation"
              value={meetingData.location}
              onChange={(e) => setMeetingData({ ...meetingData, location: e.target.value })}
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
              value={meetingData.notes}
              onChange={(e) => setMeetingData({ ...meetingData, notes: e.target.value })}
              placeholder="Additional notes"
              className="border-[#004360] focus:border-[#008dd2]"
            />
          </div>
          <div className="flex gap-2 pt-4">
            <Button
              onClick={handleScheduleMeeting}
              className="flex-1 bg-[#ef7f1a] hover:bg-[#d16a0f] text-white"
              disabled={!meetingData.title || !meetingData.date || !meetingData.time}
            >
              Schedule Meeting
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1 border-[#004360] text-[#004360]">
              Cancel
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
