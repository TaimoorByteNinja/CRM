"use client"

import { useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { selectNotifications, removeNotification } from "@/lib/store/slices/uiSlice"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, AlertTriangle, Info, X } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Notification() {
  const notifications = useAppSelector(selectNotifications)
  const dispatch = useAppDispatch()

  useEffect(() => {
    if (notifications.length > 0) {
      const latestNotification = notifications[notifications.length - 1]
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        dispatch(removeNotification(latestNotification.id))
      }, 5000)
      
      return () => clearTimeout(timer)
    }
  }, [notifications, dispatch])

  const handleClose = (id: string) => {
    dispatch(removeNotification(id))
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-600" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />
      default:
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const getNotificationVariant = (type: string) => {
    switch (type) {
      case "success":
        return "default"
      case "error":
        return "destructive"
      case "warning":
        return "default"
      default:
        return "default"
    }
  }

  const getNotificationStyles = (type: string) => {
    switch (type) {
      case "success":
        return "border-green-200 bg-green-50 text-green-800"
      case "error":
        return "border-red-200 bg-red-50 text-red-800"
      case "warning":
        return "border-yellow-200 bg-yellow-50 text-yellow-800"
      default:
        return "border-blue-200 bg-blue-50 text-blue-800"
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {notifications
        .filter(notification => notification.show)
        .map(notification => (
          <Alert
            key={notification.id}
            variant={getNotificationVariant(notification.type) as any}
            className={`${getNotificationStyles(notification.type)} shadow-lg border-l-4 transition-all duration-300 animate-in slide-in-from-right-2`}
          >
            <div className="flex items-start gap-3">
              {getNotificationIcon(notification.type)}
              <AlertDescription className="flex-1">
                {notification.message}
              </AlertDescription>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-transparent"
                onClick={() => handleClose(notification.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </Alert>
        ))}
    </div>
  )
} 