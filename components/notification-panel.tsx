"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Bell, X, RefreshCw } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface Notification {
  id: string
  title: string
  message: string
  priority: "urgent" | "important" | "normal"
  time: string
  read: boolean
  type?: string
  relatedId?: string
}

interface NotificationPanelProps {
  notifications: Notification[]
  setNotifications: (notifications: Notification[]) => void
  onRefresh?: () => void
}

export default function NotificationPanel({ notifications, setNotifications, onRefresh }: NotificationPanelProps) {
  const [isOpen, setIsOpen] = useState(false)

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "border-l-[#ef7f1a] bg-orange-50"
      case "important":
        return "border-l-[#d7af00] bg-yellow-50"
      default:
        return "border-l-[#008dd2] bg-blue-50"
    }
  }

  const markAsRead = (id: string) => {
    setNotifications(notifications.map((notif) => (notif.id === id ? { ...notif, read: true } : notif)))
  }

  const markAllAsRead = () => {
    setNotifications(notifications.map((notif) => ({ ...notif, read: true })))
  }

  const removeNotification = (id: string) => {
    setNotifications(notifications.filter((notif) => notif.id !== id))
  }

  const refreshNotifications = () => {
    if (onRefresh) {
      onRefresh()
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-[#004360] hover:bg-gray-100 rounded-lg">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-[#ef7f1a] text-white text-xs flex items-center justify-center p-0 animate-pulse">
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0 shadow-xl border-0 rounded-lg">
        <div className="p-4 border-b bg-gradient-to-r from-[#004360] to-[#008dd2] text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Recent Activities
              {unreadCount > 0 && <Badge className="bg-[#ef7f1a] text-white text-xs">{unreadCount}</Badge>}
            </h3>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={refreshNotifications}
                className="text-white hover:bg-white/20 p-1 h-6 w-6"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={markAllAsRead}
                  className="text-white hover:bg-white/20 text-xs px-2 py-1 h-6"
                >
                  Mark all read
                </Button>
              )}
            </div>
          </div>
        </div>

        <ScrollArea className="max-h-80">
          {notifications.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No recent activities</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 border-l-4 ${getPriorityColor(notification.priority)} ${
                    !notification.read ? "bg-opacity-100" : "bg-opacity-50"
                  } cursor-pointer hover:bg-opacity-75 transition-all duration-200`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 pr-2">
                      <h4 className={`font-medium text-sm ${!notification.read ? "text-[#004360]" : "text-gray-600"}`}>
                        {notification.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1 line-clamp-2">{notification.message}</p>
                      <p className="text-xs text-gray-500 mt-2">{notification.time}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeNotification(notification.id)
                      }}
                      className="text-[#004360] hover:text-red-600 p-1 h-6 w-6 opacity-60 hover:opacity-100"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
