"use client"

import { useState, useRef, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { 
  selectActivityNotifications, 
  selectUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  clearActivityNotifications
} from "@/lib/store/slices/uiSlice"
import { Button } from "@/components/ui/button"
import { 
  Bell, 
  ShoppingCart, 
  CreditCard, 
  Banknote, 
  BarChart3, 
  DollarSign,
  CheckCheck,
  Trash2,
  ExternalLink,
  Clock
} from "lucide-react"
import { useRouter } from "next/navigation"

const categoryIcons = {
  sale: ShoppingCart,
  purchase: CreditCard,
  expense: CreditCard,
  bank: Banknote,
  report: BarChart3,
  general: DollarSign
}

const categoryColors = {
  sale: "text-green-600",
  purchase: "text-blue-600", 
  expense: "text-red-600",
  bank: "text-purple-600",
  report: "text-yellow-600",
  general: "text-gray-600"
}

const priorityStyles = {
  high: "border-l-red-500 bg-red-50",
  medium: "border-l-yellow-500 bg-yellow-50", 
  low: "border-l-green-500 bg-green-50"
}

const formatTimeAgo = (timestamp: number): string => {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return "Just now"
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  return `${days}d ago`
}

export function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false)
  const [filter, setFilter] = useState<string>("all")
  const dropdownRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  
  const notifications = useAppSelector(selectActivityNotifications)
  const unreadCount = useAppSelector(selectUnreadNotificationCount)
  const dispatch = useAppDispatch()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredNotifications = notifications.filter(notification => {
    if (filter === "all") return true
    if (filter === "unread") return !notification.isRead
    return notification.category === filter
  })

  const handleNotificationClick = (notification: any) => {
    if (!notification.isRead) {
      dispatch(markNotificationAsRead(notification.id))
    }
    
    if (notification.actionUrl) {
      router.push(notification.actionUrl)
      setIsOpen(false)
    }
  }

  const handleMarkAllAsRead = () => {
    dispatch(markAllNotificationsAsRead())
  }

  const handleClearAll = () => {
    dispatch(clearActivityNotifications())
  }

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <Button
        variant="outline"
        size="sm"
        className="rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-200 relative bg-transparent"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
            {unreadCount > 99 ? "99+" : unreadCount}
          </div>
        )}
      </Button>

      {/* Notification Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-xl shadow-xl z-50 max-h-[500px] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleMarkAllAsRead}
                    className="text-xs h-6 px-2"
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearAll}
                  className="text-xs h-6 px-2 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </div>
            
            {/* Filter Tabs */}
            <div className="flex gap-1 mt-2 text-xs">
              {[
                { key: "all", label: "All" },
                { key: "unread", label: "Unread" },
                { key: "sale", label: "Sales" },
                { key: "purchase", label: "Purchase" },
                { key: "bank", label: "Banking" },
                { key: "report", label: "Reports" }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key)}
                  className={`px-2 py-1 rounded transition-colors ${
                    filter === tab.key
                      ? "bg-blue-100 text-blue-700"
                      : "text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notifications List */}
          <div className="max-h-[400px] overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <Bell className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">No notifications</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => {
                const Icon = categoryIcons[notification.category]
                const colorClass = categoryColors[notification.category]
                const priorityStyle = priorityStyles[notification.priority]

                return (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`px-4 py-3 border-l-4 hover:bg-gray-50 cursor-pointer transition-colors ${priorityStyle} ${
                      !notification.isRead ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`mt-1 ${colorClass}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className={`text-sm font-medium truncate ${
                            !notification.isRead ? "text-gray-900" : "text-gray-700"
                          }`}>
                            {notification.title}
                          </h4>
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock className="h-3 w-3" />
                            {formatTimeAgo(notification.timestamp)}
                          </div>
                        </div>
                        <p className={`text-sm text-gray-600 line-clamp-2 ${
                          !notification.isRead ? "font-medium" : ""
                        }`}>
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            notification.category === 'sale' ? 'bg-green-100 text-green-800' :
                            notification.category === 'purchase' ? 'bg-blue-100 text-blue-800' :
                            notification.category === 'expense' ? 'bg-red-100 text-red-800' :
                            notification.category === 'bank' ? 'bg-purple-100 text-purple-800' :
                            notification.category === 'report' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {notification.category}
                          </span>
                          {notification.actionUrl && (
                            <ExternalLink className="h-3 w-3 text-gray-400" />
                          )}
                        </div>
                      </div>
                      {!notification.isRead && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Footer */}
          {filteredNotifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-sm text-gray-600 hover:text-gray-900"
                onClick={() => {
                  router.push('/business-hub/overview')
                  setIsOpen(false)
                }}
              >
                View all activity
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
