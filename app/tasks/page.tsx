"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
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
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Plus, CalendarIcon, Clock, User, Filter, Search, CheckCircle, AlertCircle, Circle, Edit } from "lucide-react"
import { format } from "date-fns"
import Layout from "@/components/layout"
import ExportButton from "@/components/export-button"

interface Task {
  id: string
  title: string
  description: string
  priority: "low" | "medium" | "high"
  status: "pending" | "in-progress" | "completed"
  dueDate: string
  assignedTo: string
  category: "follow-up" | "meeting" | "call" | "email" | "proposal" | "other"
  relatedTo: string
  createdDate: string
  completedDate?: string
  reminders: string[]
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [priorityFilter, setPriorityFilter] = useState("all")
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [editSelectedDate, setEditSelectedDate] = useState<Date>()
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium" as Task["priority"],
    category: "other" as Task["category"],
    dueDate: "",
    assignedTo: "",
    relatedTo: "",
  })

  useEffect(() => {
    const savedTasks = localStorage.getItem("tasks")
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks)
      setTasks(parsedTasks)
      setFilteredTasks(parsedTasks)
    }
  }, [])

  useEffect(() => {
    let filtered = tasks.filter(
      (task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.relatedTo.toLowerCase().includes(searchTerm.toLowerCase()),
    )

    if (statusFilter !== "all") {
      filtered = filtered.filter((task) => task.status === statusFilter)
    }

    if (priorityFilter !== "all") {
      filtered = filtered.filter((task) => task.priority === priorityFilter)
    }

    setFilteredTasks(filtered)
  }, [tasks, searchTerm, statusFilter, priorityFilter])

  const saveTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks)
    localStorage.setItem("tasks", JSON.stringify(updatedTasks))
  }

  const addTask = () => {
    if (newTask.title && newTask.dueDate) {
      const task: Task = {
        id: Date.now().toString(),
        ...newTask,
        status: "pending",
        assignedTo: newTask.assignedTo || localStorage.getItem("username") || "Unassigned",
        createdDate: new Date().toISOString().split("T")[0],
        reminders: [],
      }

      const updatedTasks = [...tasks, task]
      saveTasks(updatedTasks)

      setNewTask({
        title: "",
        description: "",
        priority: "medium",
        category: "other",
        dueDate: "",
        assignedTo: "",
        relatedTo: "",
      })
      setSelectedDate(undefined)
      setIsAddTaskOpen(false)
    }
  }

  const updateTask = () => {
    if (editingTask) {
      const updatedTasks = tasks.map((task) => (task.id === editingTask.id ? editingTask : task))
      saveTasks(updatedTasks)
      setIsEditTaskOpen(false)
      setEditingTask(null)
      setEditSelectedDate(undefined)
    }
  }

  const updateTaskStatus = (taskId: string, newStatus: Task["status"]) => {
    const updatedTasks = tasks.map((task) => {
      if (task.id === taskId) {
        const updatedTask = { ...task, status: newStatus }
        if (newStatus === "completed") {
          updatedTask.completedDate = new Date().toISOString().split("T")[0]
        } else {
          delete updatedTask.completedDate
        }
        return updatedTask
      }
      return task
    })
    saveTasks(updatedTasks)
  }

  const deleteTask = (taskId: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId)
    saveTasks(updatedTasks)
  }

  const openEditTask = (task: Task) => {
    setEditingTask({ ...task })
    setEditSelectedDate(new Date(task.dueDate))
    setIsEditTaskOpen(true)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-[#ef7f1a] text-white"
      case "medium":
        return "bg-[#fecc00] text-black"
      case "low":
        return "bg-[#008dd2] text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-[#d7af00] text-white"
      case "in-progress":
        return "bg-[#008dd2] text-white"
      case "pending":
        return "bg-gray-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-[#d7af00]" />
      case "in-progress":
        return <AlertCircle className="h-4 w-4 text-[#008dd2]" />
      case "pending":
        return <Circle className="h-4 w-4 text-gray-500" />
      default:
        return <Circle className="h-4 w-4 text-gray-500" />
    }
  }

  const isOverdue = (dueDate: string, status: string) => {
    if (status === "completed") return false
    return new Date(dueDate) < new Date()
  }

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const todayTasks = filteredTasks.filter((task) => {
    const today = new Date().toISOString().split("T")[0]
    return task.dueDate === today && task.status !== "completed"
  })

  const overdueTasks = filteredTasks.filter((task) => isOverdue(task.dueDate, task.status))

  const upcomingTasks = filteredTasks.filter((task) => {
    const daysUntilDue = getDaysUntilDue(task.dueDate)
    return daysUntilDue > 0 && daysUntilDue <= 7 && task.status !== "completed"
  })

  // Export headers for tasks
  const taskExportHeaders = [
    "title",
    "description",
    "priority",
    "status",
    "dueDate",
    "assignedTo",
    "category",
    "relatedTo",
    "createdDate",
    "completedDate",
  ]

  return (
    <Layout>
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-[#004360]">Tasks & Reminders</h1>
          <div className="flex gap-2">
            <ExportButton data={tasks} filename="tasks" headers={taskExportHeaders} />
            <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#ef7f1a] hover:bg-[#d16a0f] text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="text-[#004360]">Add New Task</DialogTitle>
                  <DialogDescription>Create a new task or reminder to stay organized.</DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="taskTitle" className="text-[#004360]">
                      Task Title *
                    </Label>
                    <Input
                      id="taskTitle"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      placeholder="Enter task title"
                      className="border-[#004360] focus:border-[#008dd2]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="taskDescription" className="text-[#004360]">
                      Description
                    </Label>
                    <Textarea
                      id="taskDescription"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="Task description"
                      className="border-[#004360] focus:border-[#008dd2]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-[#004360]">Priority</Label>
                      <Select
                        value={newTask.priority}
                        onValueChange={(value) => setNewTask({ ...newTask, priority: value as Task["priority"] })}
                      >
                        <SelectTrigger className="border-[#004360] focus:border-[#008dd2]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-[#004360]">Category</Label>
                      <Select
                        value={newTask.category}
                        onValueChange={(value) => setNewTask({ ...newTask, category: value as Task["category"] })}
                      >
                        <SelectTrigger className="border-[#004360] focus:border-[#008dd2]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="follow-up">Follow-up</SelectItem>
                          <SelectItem value="meeting">Meeting</SelectItem>
                          <SelectItem value="call">Call</SelectItem>
                          <SelectItem value="email">Email</SelectItem>
                          <SelectItem value="proposal">Proposal</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-[#004360]">Due Date *</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal border-[#004360] focus:border-[#008dd2]"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            setSelectedDate(date)
                            setNewTask({ ...newTask, dueDate: date ? format(date, "yyyy-MM-dd") : "" })
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div>
                    <Label htmlFor="assignedTo" className="text-[#004360]">
                      Assigned To
                    </Label>
                    <Input
                      id="assignedTo"
                      value={newTask.assignedTo}
                      onChange={(e) => setNewTask({ ...newTask, assignedTo: e.target.value })}
                      placeholder="Assign to team member"
                      className="border-[#004360] focus:border-[#008dd2]"
                    />
                  </div>
                  <div>
                    <Label htmlFor="relatedTo" className="text-[#004360]">
                      Related To
                    </Label>
                    <Input
                      id="relatedTo"
                      value={newTask.relatedTo}
                      onChange={(e) => setNewTask({ ...newTask, relatedTo: e.target.value })}
                      placeholder="Customer, lead, or project name"
                      className="border-[#004360] focus:border-[#008dd2]"
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      onClick={addTask}
                      className="flex-1 bg-[#ef7f1a] hover:bg-[#d16a0f] text-white"
                      disabled={!newTask.title || !newTask.dueDate}
                    >
                      Add Task
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setIsAddTaskOpen(false)}
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
                <AlertCircle className="h-5 w-5 text-[#ef7f1a]" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Due Today</p>
                  <p className="text-2xl font-bold text-[#ef7f1a]">{todayTasks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-red-500" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Overdue</p>
                  <p className="text-2xl font-bold text-red-500">{overdueTasks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-[#008dd2]" />
                <div>
                  <p className="text-sm font-medium text-gray-600">This Week</p>
                  <p className="text-2xl font-bold text-[#008dd2]">{upcomingTasks.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-[#d7af00]" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Completed</p>
                  <p className="text-2xl font-bold text-[#d7af00]">
                    {tasks.filter((task) => task.status === "completed").length}
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
              placeholder="Search tasks..."
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
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={priorityFilter} onValueChange={setPriorityFilter}>
            <SelectTrigger className="w-full sm:w-48 border-[#008dd2] focus:border-[#004360]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tasks List */}
        <div className="space-y-4">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="flex items-center justify-center h-32">
                <div className="text-center text-gray-500">
                  <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No tasks found</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            filteredTasks.map((task) => (
              <Card key={task.id} className={isOverdue(task.dueDate, task.status) ? "border-red-200 bg-red-50" : ""}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <Checkbox
                        checked={task.status === "completed"}
                        onCheckedChange={(checked) => updateTaskStatus(task.id, checked ? "completed" : "pending")}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3
                            className={`font-medium ${
                              task.status === "completed" ? "line-through text-gray-500" : "text-[#004360]"
                            }`}
                          >
                            {task.title}
                          </h3>
                          <Badge className={getPriorityColor(task.priority)}>{task.priority}</Badge>
                          <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                          {task.category !== "other" && (
                            <Badge variant="outline" className="capitalize">
                              {task.category}
                            </Badge>
                          )}
                        </div>
                        {task.description && <p className="text-sm text-gray-600 mb-2">{task.description}</p>}
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <div className="flex items-center gap-1">
                            <CalendarIcon className="h-3 w-3" />
                            <span className={isOverdue(task.dueDate, task.status) ? "text-red-600 font-medium" : ""}>
                              Due: {task.dueDate}
                              {isOverdue(task.dueDate, task.status) && " (Overdue)"}
                            </span>
                          </div>
                          {task.assignedTo && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              <span>{task.assignedTo}</span>
                            </div>
                          )}
                          {task.relatedTo && <span>Related to: {task.relatedTo}</span>}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Select
                        value={task.status}
                        onValueChange={(value) => updateTaskStatus(task.id, value as Task["status"])}
                      >
                        <SelectTrigger className="w-32 h-8 text-xs border-[#004360]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditTask(task)}
                        className="text-[#004360] hover:bg-gray-100 p-1"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTask(task.id)}
                        className="text-red-600 hover:bg-red-50 p-1"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Edit Task Modal */}
        <Dialog open={isEditTaskOpen} onOpenChange={setIsEditTaskOpen}>
          <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#004360]">Edit Task</DialogTitle>
              <DialogDescription>Update task information and details.</DialogDescription>
            </DialogHeader>
            {editingTask && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="editTaskTitle" className="text-[#004360]">
                    Task Title *
                  </Label>
                  <Input
                    id="editTaskTitle"
                    value={editingTask.title}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    placeholder="Enter task title"
                    className="border-[#004360] focus:border-[#008dd2]"
                  />
                </div>
                <div>
                  <Label htmlFor="editTaskDescription" className="text-[#004360]">
                    Description
                  </Label>
                  <Textarea
                    id="editTaskDescription"
                    value={editingTask.description}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    placeholder="Task description"
                    className="border-[#004360] focus:border-[#008dd2]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#004360]">Priority</Label>
                    <Select
                      value={editingTask.priority}
                      onValueChange={(value) => setEditingTask({ ...editingTask, priority: value as Task["priority"] })}
                    >
                      <SelectTrigger className="border-[#004360] focus:border-[#008dd2]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[#004360]">Status</Label>
                    <Select
                      value={editingTask.status}
                      onValueChange={(value) => setEditingTask({ ...editingTask, status: value as Task["status"] })}
                    >
                      <SelectTrigger className="border-[#004360] focus:border-[#008dd2]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label className="text-[#004360]">Category</Label>
                  <Select
                    value={editingTask.category}
                    onValueChange={(value) => setEditingTask({ ...editingTask, category: value as Task["category"] })}
                  >
                    <SelectTrigger className="border-[#004360] focus:border-[#008dd2]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="follow-up">Follow-up</SelectItem>
                      <SelectItem value="meeting">Meeting</SelectItem>
                      <SelectItem value="call">Call</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="proposal">Proposal</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[#004360]">Due Date *</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal border-[#004360] focus:border-[#008dd2]"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {editSelectedDate ? format(editSelectedDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={editSelectedDate}
                        onSelect={(date) => {
                          setEditSelectedDate(date)
                          setEditingTask({
                            ...editingTask,
                            dueDate: date ? format(date, "yyyy-MM-dd") : editingTask.dueDate,
                          })
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                <div>
                  <Label htmlFor="editAssignedTo" className="text-[#004360]">
                    Assigned To
                  </Label>
                  <Input
                    id="editAssignedTo"
                    value={editingTask.assignedTo}
                    onChange={(e) => setEditingTask({ ...editingTask, assignedTo: e.target.value })}
                    placeholder="Assign to team member"
                    className="border-[#004360] focus:border-[#008dd2]"
                  />
                </div>
                <div>
                  <Label htmlFor="editRelatedTo" className="text-[#004360]">
                    Related To
                  </Label>
                  <Input
                    id="editRelatedTo"
                    value={editingTask.relatedTo}
                    onChange={(e) => setEditingTask({ ...editingTask, relatedTo: e.target.value })}
                    placeholder="Customer, lead, or project name"
                    className="border-[#004360] focus:border-[#008dd2]"
                  />
                </div>
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={updateTask}
                    className="flex-1 bg-[#d7af00] text-white"
                    disabled={!editingTask.title || !editingTask.dueDate}
                  >
                    Save Changes
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditTaskOpen(false)
                      setEditingTask(null)
                      setEditSelectedDate(undefined)
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
