"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { motion, AnimatePresence } from "framer-motion"
import { Chrome } from "lucide-react"

interface Props {
  open: boolean
  onClose: () => void
}

export default function AuthModal({ open, onClose }: Props) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError(error.message)
    }
    if (!error) {
      onClose()
      window.location.href = "/dashboard"
    }
  }

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({ provider: "google" })
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <motion.div className="bg-white text-black w-80 rounded-xl p-6" initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}>
            <h2 className="text-xl font-bold mb-4">{isSignUp ? "Sign Up" : "Sign In"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <Button type="submit" className="w-full">{isSignUp ? "Create account" : "Sign in"}</Button>
            </form>
            <div className="mt-4">
              <Button onClick={handleGoogle} variant="outline" className="w-full"><Chrome className="w-4 h-4 mr-2"/>Continue with Google</Button>
            </div>
            <div className="text-sm mt-4 text-center">
              {isSignUp ? (
                <span>Already have an account? <button className="underline" onClick={() => setIsSignUp(false)}>Sign in</button></span>
              ) : (
                <span>Don't have an account? <button className="underline" onClick={() => setIsSignUp(true)}>Sign up</button></span>
              )}
            </div>
            <button className="absolute top-3 right-3" onClick={onClose}>✕</button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
