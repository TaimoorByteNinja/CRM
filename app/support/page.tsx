"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Headphones,
  MessageCircle,
  Mail,
  Phone,
  Clock,
  CheckCircle,
  ArrowRight,
  Search,
  ChevronDown,
  Star,
  Users,
  Zap,
  Shield,
  Globe,
  Calendar,
  FileText,
  Video,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Send,
  MapPin,
  ExternalLink,
  Mic,
  Camera,
  Paperclip,
  Smile,
} from "lucide-react"
import { useState } from "react"
import { Navigation } from "@/components/navigation"

export default function Support() {
  const [selectedCategory, setSelectedCategory] = useState("general")
  const [selectedPriority, setSelectedPriority] = useState("medium")
  const [searchQuery, setSearchQuery] = useState("")
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
    category: "general",
    priority: "medium",
  })

  const supportChannels = [
    {
      title: "Live Chat",
      description: "Get instant help from our support team",
      icon: MessageCircle,
      availability: "24/7 Available",
      responseTime: "< 2 minutes",
      gradient: "from-blue-500 to-cyan-500",
      status: "online",
    },
    {
      title: "Email Support",
      description: "Detailed help via email",
      icon: Mail,
      availability: "24/7 Available",
      responseTime: "< 4 hours",
      gradient: "from-purple-500 to-pink-500",
      status: "online",
    },
    {
      title: "Phone Support",
      description: "Speak directly with our experts",
      icon: Phone,
      availability: "Mon-Fri 9AM-6PM EST",
      responseTime: "Immediate",
      gradient: "from-green-500 to-emerald-500",
      status: "online",
    },
    {
      title: "Video Call",
      description: "Screen sharing and video assistance",
      icon: Video,
      availability: "By appointment",
      responseTime: "Same day",
      gradient: "from-orange-500 to-red-500",
      status: "available",
    },
  ]

  const supportStats = [
    { label: "Avg Response Time", value: "< 2 min", icon: Clock, color: "text-blue-400" },
    { label: "Customer Satisfaction", value: "98%", icon: Star, color: "text-yellow-400" },
    { label: "Issues Resolved", value: "99.9%", icon: CheckCircle, color: "text-green-400" },
    { label: "Support Agents", value: "50+", icon: Users, color: "text-purple-400" },
  ]

  const categories = [
    { id: "general", name: "General Questions", icon: HelpCircle },
    { id: "technical", name: "Technical Issues", icon: AlertCircle },
    { id: "billing", name: "Billing & Payments", icon: FileText },
    { id: "features", name: "Feature Requests", icon: Zap },
    { id: "integrations", name: "Integrations", icon: Globe },
    { id: "security", name: "Security & Privacy", icon: Shield },
  ]

  const priorities = [
    { id: "low", name: "Low", color: "bg-green-500/20 text-green-300 border-green-500/30" },
    { id: "medium", name: "Medium", color: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
    { id: "high", name: "High", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
    { id: "urgent", name: "Urgent", color: "bg-red-500/20 text-red-300 border-red-500/30" },
  ]

  const faqs = [
    {
      question: "How do I get started with CraftCRM?",
      answer:
        "Getting started is easy! Sign up for a free trial, and our onboarding wizard will guide you through setting up your first CRM dashboard. You can also check out our quick start guide in the documentation.",
      category: "general",
    },
    {
      question: "Can I import data from my existing CRM?",
      answer:
        "Yes! CraftCRM supports data import from most popular CRM platforms including Salesforce, HubSpot, Pipedrive, and more. We also provide CSV import functionality and migration assistance.",
      category: "technical",
    },
    {
      question: "What integrations are available?",
      answer:
        "We offer 500+ integrations including email marketing tools, accounting software, communication platforms, and more. Popular integrations include Slack, Gmail, QuickBooks, Mailchimp, and Zapier.",
      category: "integrations",
    },
    {
      question: "How secure is my data?",
      answer:
        "Your data security is our top priority. We use bank-level encryption, SOC 2 compliance, regular security audits, and offer features like two-factor authentication and single sign-on.",
      category: "security",
    },
    {
      question: "Can I customize my CRM dashboard?",
      answer:
        "CraftCRM's drag-and-drop builder allows you to create completely custom dashboards. You can add, remove, and rearrange modules, change themes, and create multiple dashboard layouts.",
      category: "features",
    },
    {
      question: "What are the pricing plans?",
      answer:
        "We offer flexible pricing starting at $29/month for small teams. All plans include core features with different limits on contacts, team members, and advanced features. Check our pricing page for details.",
      category: "billing",
    },
  ]

  const recentUpdates = [
    {
      title: "New Mobile App Released",
      description: "Enhanced mobile experience with offline sync",
      date: "2 days ago",
      type: "Feature",
    },
    {
      title: "API Rate Limits Increased",
      description: "Higher API limits for all paid plans",
      date: "1 week ago",
      type: "Improvement",
    },
    {
      title: "Security Update",
      description: "Enhanced encryption and security measures",
      date: "2 weeks ago",
      type: "Security",
    },
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Support ticket submitted:", formData)
    // Handle form submission
  }

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Enhanced floating elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-green-500/5 rounded-full blur-2xl animate-pulse delay-500"></div>

        {/* Floating particles */}
        {[...Array(25)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${2 + Math.random() * 3}s`,
            }}
          ></div>
        ))}
      </div>

      <Navigation />

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20 text-center">
        <div className="max-w-4xl mx-auto">
          <Badge className="mb-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/30 text-blue-300">
            <Headphones className="w-3 h-3 mr-1" />
            24/7 Support
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
            We're here to
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-green-400 bg-clip-text text-transparent">
              help you succeed
            </span>
          </h1>
          <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
            Get expert help from our dedicated support team. We're available 24/7 to ensure your success with CraftCRM.
          </p>

          {/* Support Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {supportStats.map((stat, index) => (
              <Card
                key={index}
                className="backdrop-blur-xl bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300"
              >
                <CardContent className="p-6 text-center">
                  <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-400">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Support Channels */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Choose Your Support Channel
            </h2>
            <p className="text-xl text-gray-400">Multiple ways to get the help you need</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportChannels.map((channel, index) => (
              <Card
                key={index}
                className="group backdrop-blur-xl bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-500 hover:scale-105 cursor-pointer"
              >
                <CardContent className="p-6 text-center">
                  <div className="relative mb-6">
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${channel.gradient} flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300`}
                    >
                      <channel.icon className="w-8 h-8 text-white" />
                    </div>
                    <div
                      className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        channel.status === "online"
                          ? "bg-green-500 text-white"
                          : "bg-yellow-500 text-black animate-pulse"
                      }`}
                    >
                      ●
                    </div>
                  </div>
                  <h3 className="text-xl font-semibold mb-2 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all duration-300">
                    {channel.title}
                  </h3>
                  <p className="text-gray-400 mb-4">{channel.description}</p>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center justify-center text-sm text-gray-300">
                      <Clock className="w-4 h-4 mr-2" />
                      {channel.availability}
                    </div>
                    <div className="flex items-center justify-center text-sm text-green-400">
                      <Zap className="w-4 h-4 mr-2" />
                      {channel.responseTime}
                    </div>
                  </div>
                  <Button className={`w-full bg-gradient-to-r ${channel.gradient} hover:opacity-90 text-white`}>
                    Start {channel.title}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form & FAQ */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-4 text-white">Submit a Support Ticket</h2>
                <p className="text-gray-400">
                  Can't find what you're looking for? Send us a detailed message and we'll get back to you quickly.
                </p>
              </div>

              <Card className="backdrop-blur-xl bg-white/5 border-white/10">
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-gray-300">
                          Full Name
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => handleInputChange("name", e.target.value)}
                          className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-gray-300">
                          Email Address
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="john@company.com"
                          value={formData.email}
                          onChange={(e) => handleInputChange("email", e.target.value)}
                          className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">Category</Label>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {categories.map((category) => (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => {
                              setSelectedCategory(category.id)
                              handleInputChange("category", category.id)
                            }}
                            className={`flex items-center space-x-2 p-3 rounded-xl border transition-all duration-300 ${
                              selectedCategory === category.id
                                ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-blue-500/50 text-white"
                                : "bg-white/5 border-white/20 text-gray-300 hover:bg-white/10"
                            }`}
                          >
                            <category.icon className="w-4 h-4" />
                            <span className="text-sm">{category.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-gray-300">Priority Level</Label>
                      <div className="flex flex-wrap gap-3">
                        {priorities.map((priority) => (
                          <button
                            key={priority.id}
                            type="button"
                            onClick={() => {
                              setSelectedPriority(priority.id)
                              handleInputChange("priority", priority.id)
                            }}
                            className={`px-4 py-2 rounded-xl border transition-all duration-300 ${
                              selectedPriority === priority.id
                                ? priority.color
                                : "bg-white/5 border-white/20 text-gray-300 hover:bg-white/10"
                            }`}
                          >
                            {priority.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject" className="text-gray-300">
                        Subject
                      </Label>
                      <Input
                        id="subject"
                        type="text"
                        placeholder="Brief description of your issue"
                        value={formData.subject}
                        onChange={(e) => handleInputChange("subject", e.target.value)}
                        className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message" className="text-gray-300">
                        Message
                      </Label>
                      <Textarea
                        id="message"
                        placeholder="Please provide as much detail as possible about your issue..."
                        value={formData.message}
                        onChange={(e) => handleInputChange("message", e.target.value)}
                        className="bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20 min-h-[120px]"
                        required
                      />
                    </div>

                    {/* Attachment and additional options */}
                    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                      <div className="flex items-center space-x-4">
                        <Button type="button" variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                          <Paperclip className="w-4 h-4 mr-2" />
                          Attach File
                        </Button>
                        <Button type="button" variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                          <Mic className="w-4 h-4 mr-2" />
                          Voice Note
                        </Button>
                        <Button type="button" variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                          <Camera className="w-4 h-4 mr-2" />
                          Screenshot
                        </Button>
                      </div>
                      <Button type="button" variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                        <Smile className="w-4 h-4" />
                      </Button>
                    </div>

                    <Button
                      type="submit"
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-semibold py-3 shadow-2xl shadow-blue-500/25"
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Submit Ticket
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* FAQ Section */}
            <div>
              <div className="mb-8">
                <h2 className="text-3xl font-bold mb-4 text-white">Frequently Asked Questions</h2>
                <p className="text-gray-400">Quick answers to common questions</p>
              </div>

              {/* FAQ Search */}
              <div className="relative mb-6">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <Input
                  placeholder="Search FAQs..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-white/5 border-white/20 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto">
                {filteredFaqs.map((faq, index) => (
                  <Card
                    key={index}
                    className="backdrop-blur-xl bg-white/5 border-white/10 hover:bg-white/10 transition-all duration-300"
                  >
                    <CardContent className="p-0">
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                        className="w-full flex items-center justify-between p-6 text-left"
                      >
                        <span className="font-semibold text-white pr-4">{faq.question}</span>
                        <ChevronDown
                          className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${
                            expandedFaq === index ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {expandedFaq === index && (
                        <div className="px-6 pb-6">
                          <p className="text-gray-300 leading-relaxed">{faq.answer}</p>
                          <div className="mt-4 flex items-center space-x-4">
                            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                              Was this helpful?
                            </Button>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-green-400">
                                👍
                              </Button>
                              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-red-400">
                                👎
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Updates & Contact Info */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Recent Updates */}
            <Card className="backdrop-blur-xl bg-white/5 border-white/10">
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Recent Updates</h3>
                    <p className="text-gray-400">Latest improvements and fixes</p>
                  </div>
                </div>
                <div className="space-y-4">
                  {recentUpdates.map((update, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-4 p-4 bg-white/5 rounded-xl border border-white/10 hover:bg-white/10 transition-colors duration-300"
                    >
                      <div
                        className={`w-3 h-3 rounded-full mt-2 ${
                          update.type === "Feature"
                            ? "bg-blue-400"
                            : update.type === "Security"
                              ? "bg-red-400"
                              : "bg-green-400"
                        }`}
                      ></div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-white">{update.title}</h4>
                          <Badge className="bg-white/10 text-gray-300 border-white/20 text-xs">{update.type}</Badge>
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{update.description}</p>
                        <span className="text-xs text-gray-500">{update.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-6 border-white/20 text-white hover:bg-white/10 bg-transparent"
                >
                  View All Updates
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card className="backdrop-blur-xl bg-white/5 border-white/10">
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white">Contact Information</h3>
                    <p className="text-gray-400">Multiple ways to reach us</p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">Email Support</div>
                      <div className="text-gray-400">support@craftcrm.com</div>
                      <div className="text-xs text-gray-500">Response within 4 hours</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">Phone Support</div>
                      <div className="text-gray-400">+1 (555) 123-4567</div>
                      <div className="text-xs text-gray-500">Mon-Fri 9AM-6PM EST</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                      <MessageCircle className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">Live Chat</div>
                      <div className="text-gray-400">Available 24/7</div>
                      <div className="text-xs text-gray-500">Average response: 2 minutes</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                      <MapPin className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                      <div className="font-semibold text-white">Office Address</div>
                      <div className="text-gray-400">123 Tech Street, Suite 100</div>
                      <div className="text-gray-400">San Francisco, CA 94105</div>
                    </div>
                  </div>
                </div>
                <div className="mt-8 p-4 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-blue-400" />
                    <div>
                      <div className="font-semibold text-white">Schedule a Call</div>
                      <div className="text-sm text-gray-400">Book a personalized support session</div>
                    </div>
                  </div>
                  <Button className="w-full mt-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white">
                    Book Appointment
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Emergency Support */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <Card className="backdrop-blur-xl bg-gradient-to-r from-red-500/10 to-orange-500/10 border-red-500/20 p-12">
            <CardContent className="p-0">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-red-500 to-orange-500 flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                Need Urgent Help?
              </h2>
              <p className="text-xl text-gray-400 mb-8">
                For critical issues affecting your business operations, contact our emergency support line
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600 text-white px-8 py-4 text-lg font-semibold"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Emergency Line: +1 (555) 911-HELP
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-red-500/30 text-red-300 hover:bg-red-500/10 px-8 py-4 text-lg bg-transparent"
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Priority Chat
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  )
}
