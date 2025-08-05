"use client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function FeatureTemplate({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="min-h-screen p-6 bg-gradient-to-br from-slate-900 to-slate-950 text-white">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold mb-4">{title}</h1>
        <Card className="bg-white/10">
          <CardContent className="p-6 space-y-4">{children}</CardContent>
        </Card>
        <Button asChild className="mt-4">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  )
}
