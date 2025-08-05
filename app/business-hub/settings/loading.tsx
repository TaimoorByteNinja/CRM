import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function SettingsLoading() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        {/* Sidebar Skeleton */}
        <div className="w-64 bg-slate-800 min-h-screen">
          <div className="p-4">
            <div className="flex items-center space-x-2 mb-6">
              <Skeleton className="w-6 h-6 bg-slate-600" />
              <Skeleton className="h-6 w-20 bg-slate-600" />
              <Skeleton className="w-4 h-4 ml-auto bg-slate-600" />
            </div>

            <div className="space-y-1">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-3 px-3 py-3">
                  <Skeleton className="w-4 h-4 bg-slate-600" />
                  <Skeleton className="h-4 flex-1 bg-slate-600" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Skeleton */}
        <div className="flex-1">
          {/* Header Skeleton */}
          <div className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="w-8 h-8" />
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="p-6">
            <div className="space-y-8">
              {/* Cards Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-32" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Array.from({ length: 5 }).map((_, j) => (
                        <div key={j} className="flex items-center justify-between">
                          <div className="space-y-1">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-3 w-32" />
                          </div>
                          <Skeleton className="w-10 h-6 rounded-full" />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Large Card */}
              <Card>
                <CardHeader>
                  <Skeleton className="h-6 w-40" />
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <Skeleton className="w-4 h-4" />
                        <Skeleton className="h-4 flex-1" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Two Column Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {Array.from({ length: 2 }).map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-48" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, j) => (
                          <div key={j} className="flex items-center space-x-2">
                            <Skeleton className="w-4 h-4" />
                            <Skeleton className="h-4 flex-1" />
                          </div>
                        ))}
                      </div>
                      <Skeleton className="h-10 w-32" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
