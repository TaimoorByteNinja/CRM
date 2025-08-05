"use client"

import type React from "react"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Clock, MessageCircle, Headphones, Zap, Package, Send } from "lucide-react"
import Link from "next/link"
import { useState } from "react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    subject: "",
    message: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission here
    console.log("Form submitted:", formData)
  }

  const contactMethods = [
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our support team",
      contact: "+92 300 1234567",
      availability: "Mon-Fri, 9 AM - 6 PM PKT",
      color: "blue",
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us an email and we'll respond within 24 hours",
      contact: "support@craftcrm.com",
      availability: "24/7 Response",
      color: "green",
    },
    // {
    //   icon: MessageCircle,
    //   title: "Live Chat",
    //   description: "Chat with our team in real-time",
    //   contact: "Available on website",
    //   availability: "Mon-Fri, 9 AM - 6 PM PKT",
    //   color: "purple",
    // },
    // {
    //   icon: Headphones,
    //   title: "Technical Support",
    //   description: "Get help with technical issues and setup",
    //   contact: "tech@craftcrm.com",
    //   availability: "Priority Support Available",
    //   color: "orange",
    // },
  ]

  const offices = [
    // {
    //   city: "Karachi",
    //   country: "Pakistan",
    //   address: "Office 301, Business Center, Gulshan-e-Iqbal, Karachi, Pakistan",
    //   phone: "+92 21 1234567",
    //   email: "karachi@craftcrm.com",
    // },
    {
      city: "Lahore",
      country: "Pakistan",
      address: "Suite 205, IT Tower, Johar Town, Lahore, Pakistan",
      phone: "+92 42 1234567",
      email: "lahore@craftcrm.com",
    },
    // {
    //   city: "Mumbai",
    //   country: "India",
    //   address: "Floor 12, Tech Hub, Andheri East, Mumbai, India",
    //   phone: "+91 22 1234567",
    //   email: "mumbai@craftcrm.com",
    // },
  ]

  const faqs = [
    {
      question: "How quickly can I get started with CraftCRM?",
      answer:
        "You can start using CraftCRM immediately after signing up. Our setup wizard helps you import your data and configure the system in under 30 minutes.",
    },
    {
      question: "Do you provide training for new users?",
      answer:
        "Yes! We offer comprehensive training including video tutorials, documentation, and live training sessions for teams. Our support team is always available to help.",
    },
    {
      question: "Can I migrate my existing data to CraftCRM?",
      answer:
        "We support data import from Excel, CSV files, and most popular inventory management systems. Our team can help with the migration process.",
    },
    {
      question: "What kind of support do you provide?",
      answer:
        "We offer multiple support channels including phone, email, live chat, and a comprehensive knowledge base. Premium customers get priority support with faster response times.",
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="bg-blue-100 text-blue-800 mb-6">
              <Headphones className="w-4 h-4 mr-2" />
              Get in Touch
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              We're Here 24/7 to
              <br />
              <span className="text-blue-600">Help You Succeed</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Have questions about CraftCRM? Need help getting started? Our expert team is ready to assist you every
              step of the way.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                asChild
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg font-semibold rounded-lg shadow-lg"
              >
                <Link href="/start-trial">
                  <Zap className="w-5 h-5 mr-2" />
                  Get Started
                </Link>
              </Button>
              {/* <Button
                size="lg"
                variant="outline"
                className="border-2 border-blue-600 text-blue-600 hover:bg-blue-50 px-8 py-4 text-lg font-semibold rounded-lg bg-transparent"
              >
                Schedule Demo
              </Button> */}
            </div>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
        <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">Multiple Ways to Reach Us</h2>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Choose the contact method that works best for you. We're committed to providing excellent support.
        </p>
          </div>

          <div className="flex justify-center">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl">
          {contactMethods.map((method, index) => (
            <Card
          key={index}
          className="border border-gray-200 hover:shadow-lg transition-shadow duration-300 text-center"
            >
          <CardContent className="p-8">
            <div
              className={`w-16 h-16 bg-${method.color}-100 rounded-full flex items-center justify-center mx-auto mb-6`}
            >
              <method.icon className={`w-8 h-8 text-${method.color}-600`} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">{method.title}</h3>
            <p className="text-gray-600 mb-4">{method.description}</p>
            <div className="text-blue-600 font-semibold mb-2">{method.contact}</div>
            <div className="text-sm text-gray-500">{method.availability}</div>
          </CardContent>
            </Card>
          ))}
        </div>
          </div>
        </div>
      </section>

      {/* Contact Form & Office Info */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Send Us a Message</h2>
              <p className="text-gray-600 mb-8">
                Fill out the form below and we'll get back to you within 24 hours. For urgent matters, please call us
                directly.
              </p>

              <Card className="border border-gray-200">
                <CardContent className="p-8">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                          Full Name *
                        </label>
                        <Input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full"
                          placeholder="Your full name"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                          Email Address *
                        </label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full"
                          placeholder="your@email.com"
                        />
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                          Phone Number
                        </label>
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full"
                          placeholder="+92 300 1234567"
                        />
                      </div>
                      <div>
                        <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                          Company Name
                        </label>
                        <Input
                          id="company"
                          name="company"
                          type="text"
                          value={formData.company}
                          onChange={handleInputChange}
                          className="w-full"
                          placeholder="Your company name"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                        Subject *
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        type="text"
                        required
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="w-full"
                        placeholder="How can we help you?"
                      />
                    </div>

                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message *
                      </label>
                      <Textarea
                        id="message"
                        name="message"
                        required
                        value={formData.message}
                        onChange={handleInputChange}
                        className="w-full h-32"
                        placeholder="Tell us more about your requirements..."
                      />
                    </div>

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                      <Send className="w-4 h-4 mr-2" />
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Office Information */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Offices</h2>
              <p className="text-gray-600 mb-8">
                Visit us at one of our offices or reach out to your nearest location for personalized support.
              </p>

              <div className="space-y-6">
                {offices.map((office, index) => (
                  <Card key={index} className="border border-gray-200">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                          <MapPin className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-gray-900 mb-2">
                            {office.city}, {office.country}
                          </h3>
                          <p className="text-gray-600 mb-3">{office.address}</p>
                          <div className="space-y-1 text-sm">
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{office.phone}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="w-4 h-4 text-gray-400" />
                              <span className="text-gray-600">{office.email}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Business Hours */}
              {/* <Card className="border border-gray-200 mt-8">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Clock className="w-6 h-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">Business Hours</h3>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex justify-between">
                          <span>Monday - Friday:</span>
                          <span>9:00 AM - 6:00 PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Saturday:</span>
                          <span>10:00 AM - 4:00 PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Sunday:</span>
                          <span>Closed</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card> */}
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">Quick answers to common questions about CraftCRM</p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index} className="border border-gray-200">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                  <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* <div className="text-center mt-12">
            <p className="text-gray-600 mb-4">Can't find what you're looking for?</p>
            <Button variant="outline" className="border-blue-600 text-blue-600 hover:bg-blue-50 bg-transparent">
              View All FAQs
            </Button>
          </div> */}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Don't wait! Start your free trial today for 7 days  and see how CraftCRM can transform your business operations.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              asChild
              className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-4 text-lg font-semibold rounded-lg"
            >
              <Link href="/start-trial">
                <Zap className="w-5 h-5 mr-2" />
                Get Started
              </Link>
            </Button>
            {/* <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-10 py-4 text-lg font-semibold rounded-lg bg-transparent"
            >
              Schedule a Demo
            </Button> */}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <span className="text-2xl font-bold">CraftCRM</span>
              </div>
              <p className="text-gray-400 mb-6">
                Smart inventory management solution trusted by over 50,000 businesses across Pakistan and India.
              </p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6">Product</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <Link href="/features" className="hover:text-white">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="/solutions" className="hover:text-white">
                    Solutions
                  </Link>
                </li>
                <li>
                  <Link href="/pricing" className="hover:text-white">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6">Support</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <span className="hover:text-white cursor-pointer">Help Center</span>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact Support
                  </Link>
                </li>
                <li>
                  <span className="hover:text-white cursor-pointer">Training</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-6">Company</h4>
              <ul className="space-y-3 text-gray-400">
                <li>
                  <span className="hover:text-white cursor-pointer">About Us</span>
                </li>
                <li>
                  <span className="hover:text-white cursor-pointer">Careers</span>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white">
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 mb-4 md:mb-0">© 2024 CraftCRM. All rights reserved.</p>
              <div className="flex space-x-6 text-gray-400">
                <span className="hover:text-white cursor-pointer">Privacy Policy</span>
                <span className="hover:text-white cursor-pointer">Terms of Service</span>
                <span className="hover:text-white cursor-pointer">Security</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
