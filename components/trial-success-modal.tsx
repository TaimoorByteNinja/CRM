"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { CheckCircle, Sparkles, Calendar, Zap } from "lucide-react"
import { useRouter } from "next/navigation"

interface TrialSuccessModalProps {
  open: boolean
  onClose: () => void
}

export default function TrialSuccessModal({ open, onClose }: TrialSuccessModalProps) {
  const router = useRouter()

  const handleOkay = () => {
    onClose()
    router.push("/dashboard")
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="glass-effect border-0 max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/30 to-emerald-500/30 blur-2xl rounded-full"></div>
            <div className="relative w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
          </div>
          <DialogTitle className="text-2xl font-bold text-white mb-2">🎉 Welcome to CraftCRM!</DialogTitle>
          <DialogDescription className="text-gray-300 text-lg">Enjoy your free 14-day trial!</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 my-6">
          <div className="glass-effect p-4 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-white font-semibold">Your Trial Includes:</h3>
            </div>
            <div className="space-y-2 text-sm text-gray-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Full access to all premium features</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Unlimited business modules</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Advanced analytics & reporting</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-green-400" />
                <span>Priority customer support</span>
              </div>
            </div>
          </div>

          <div className="glass-effect p-3 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-400" />
              <span className="text-yellow-300 text-sm font-medium">No credit card required • Cancel anytime</span>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity duration-300"></div>
            <Button
              onClick={handleOkay}
              className="relative bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white px-8 py-3 text-lg font-semibold shadow-2xl shadow-green-500/25 rounded-xl group-hover:scale-105 transition-all duration-300"
            >
              <div className="flex items-center space-x-2">
                <Zap className="w-5 h-5" />
                <span>Let's Get Started!</span>
              </div>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
