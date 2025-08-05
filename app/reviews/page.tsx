"use client"

import { Navigation } from "@/components/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Quote, TrendingUp, Users, Award, CheckCircle, Package, Zap, Building2, MapPin } from "lucide-react"
import Link from "next/link"
import NextLink from "next/link"

export default function ReviewsPage() {
  const testimonials = [
    {
      name: "Rajesh Kumar",
      business: "Kumar Electronics",
      location: "Delhi, India",
      rating: 5,
      content:
        "CraftCRM completely transformed our electronics business. We reduced stockouts by 95% and cut inventory costs by 25%. The real-time tracking is a game-changer! Our team can now focus on growing the business instead of managing spreadsheets.",
      image: "/placeholder.svg?height=80&width=80&text=RK",
      businessType: "Electronics Retail",
      results: ["95% reduction in stockouts", "25% cost savings", "3x faster inventory audits"],
    },
    {
      name: "Priya Sharma",
      business: "Sharma Textiles",
      location: "Mumbai, India",
      rating: 5,
      content:
        "Managing inventory across 5 locations was a nightmare before CraftCRM. Now everything is automated and we have complete visibility of our stock. The multi-location feature is exactly what we needed for our growing business.",
      image: "/placeholder.svg?height=80&width=80&text=PS",
      businessType: "Textile Manufacturing",
      results: ["5 locations managed", "100% stock visibility", "50% time savings"],
    },
    {
      name: "Amit Patel",
      business: "Patel Trading Co.",
      location: "Ahmedabad, India",
      rating: 5,
      content:
        "The barcode scanning feature saves us hours every day. Stock updates are instant and accurate. Best investment we've made for our business! Customer support is also exceptional - they helped us migrate all our data seamlessly.",
      image: "/placeholder.svg?height=80&width=80&text=AP",
      businessType: "Wholesale Trading",
      results: ["4 hours saved daily", "99.9% accuracy", "Seamless data migration"],
    },
    {
      name: "Sunita Reddy",
      business: "Reddy Pharmaceuticals",
      location: "Hyderabad, India",
      rating: 5,
      content:
        "As a pharmacy, we need to track expiry dates and batch numbers carefully. CraftCRM's pharmacy module handles all our compliance requirements perfectly. The automated alerts for expiring medicines have saved us thousands in waste.",
      image: "/placeholder.svg?height=80&width=80&text=SR",
      businessType: "Pharmacy",
      results: ["Zero expired stock", "Compliance maintained", "₹50K saved monthly"],
    },
    {
      name: "Mohammed Ali",
      business: "Ali Restaurant Chain",
      location: "Karachi, Pakistan",
      rating: 5,
      content:
        "Running 3 restaurants with different menus was complex until we found CraftCRM. The ingredient tracking and recipe management features help us maintain consistency across all locations while controlling food costs effectively.",
      image: "/placeholder.svg?height=80&width=80&text=MA",
      businessType: "Restaurant Chain",
      results: ["3 locations synchronized", "20% food cost reduction", "Consistent quality"],
    },
    {
      name: "Fatima Khan",
      business: "Khan Fashion House",
      location: "Lahore, Pakistan",
      rating: 5,
      content:
        "The clothing module with size and color variants is perfect for our fashion business. Seasonal collection management and trend analysis help us make better buying decisions. Sales have increased by 30% since implementation.",
      image: "/placeholder.svg?height=80&width=80&text=FK",
      businessType: "Fashion Retail",
      results: ["30% sales increase", "Better buying decisions", "Seasonal planning"],
    },
  ]

  const stats = [
    { icon: Users, value: "50,000+", label: "Happy Customers" },
    { icon: Star, value: "4.9/5", label: "Average Rating" },
    { icon: TrendingUp, value: "98%", label: "Customer Satisfaction" },
    { icon: Award, value: "500+", label: "5-Star Reviews" },
  ]

  const industries = [
    { name: "Retail", count: "15,000+" },
    { name: "Pharmacy", count: "8,500+" },
    { name: "Restaurant", count: "6,200+" },
    { name: "Grocery", count: "5,800+" },
    { name: "Electronics", count: "4,500+" },
    { name: "Fashion", count: "3,200+" },
    { name: "Jewellery", count: "2,100+" },
    { name: "Others", count: "4,700+" },
  ]

  return (
    <div className="min-h-screen bg-white">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-100 py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="bg-blue-100 text-blue-800 mb-6">
              <Star className="w-4 h-4 mr-2" />
              Customer Reviews
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              What Our Customers
              <br />
              <span className="text-blue-600">Are Saying</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed max-w-3xl mx-auto">
              Don't just take our word for it. See what thousands of businesses across Pakistan and India are saying
              about CraftCRM and how it's transforming their operations.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <stat.icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Reviews */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">Featured Customer Stories</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Real businesses, real results. See how CraftCRM is making a difference across different industries.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border border-gray-200 hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-8">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>

                  <Quote className="w-8 h-8 text-blue-600 mb-4" />

                  <p className="text-gray-700 mb-6 leading-relaxed text-lg">"{testimonial.content}"</p>

                  {/* Results */}
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Key Results:</h4>
                    <div className="space-y-2">
                      {testimonial.results.map((result, resultIndex) => (
                        <div key={resultIndex} className="flex items-center gap-2 text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                          <span>{result}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                    <img
                      src={testimonial.image || "/placeholder.svg"}
                      alt={testimonial.name}
                      className="w-16 h-16 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900 text-lg">{testimonial.name}</div>
                      <div className="text-blue-600 font-medium">{testimonial.business}</div>
                      <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{testimonial.location}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Building2 className="w-3 h-3" />
                          <span>{testimonial.businessType}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Industry Breakdown */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">Trusted Across Industries</h2>
            <p className="text-xl text-gray-600">Businesses from every sector trust CraftCRM for their operations</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {industries.map((industry, index) => (
              <Card
                key={index}
                className="border border-gray-200 text-center hover:shadow-lg transition-shadow duration-300"
              >
                <CardContent className="p-6">
                  <div className="text-2xl font-bold text-blue-600 mb-2">{industry.count}</div>
                  <div className="text-gray-900 font-medium">{industry.name}</div>
                  <div className="text-sm text-gray-500 mt-1">businesses</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Review Highlights */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-gray-900 mb-4">What Customers Love Most</h2>
            <p className="text-xl text-gray-600">
              The features and benefits that customers mention most in their reviews
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Real-Time Tracking",
                percentage: "94%",
                description: "of customers love the real-time inventory tracking feature",
                icon: TrendingUp,
                color: "blue",
              },
              {
                title: "Easy to Use",
                percentage: "91%",
                description: "find CraftCRM intuitive and easy to learn",
                icon: CheckCircle,
                color: "green",
              },
              {
                title: "Great Support",
                percentage: "96%",
                description: "rate our customer support as excellent",
                icon: Users,
                color: "purple",
              },
              {
                title: "Cost Savings",
                percentage: "88%",
                description: "report significant cost savings within 3 months",
                icon: TrendingUp,
                color: "orange",
              },
              {
                title: "Time Efficiency",
                percentage: "92%",
                description: "save 3+ hours daily on inventory management",
                icon: CheckCircle,
                color: "indigo",
              },
              {
                title: "Reliability",
                percentage: "98%",
                description: "experience 99.9% uptime and system reliability",
                icon: Award,
                color: "red",
              },
            ].map((highlight, index) => (
              <Card
                key={index}
                className="border border-gray-200 text-center hover:shadow-lg transition-shadow duration-300"
              >
                <CardContent className="p-8">
                  <div
                    className={`w-16 h-16 bg-${highlight.color}-100 rounded-full flex items-center justify-center mx-auto mb-6`}
                  >
                    <highlight.icon className={`w-8 h-8 text-${highlight.color}-600`} />
                  </div>
                  <div className="text-4xl font-bold text-gray-900 mb-2">{highlight.percentage}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{highlight.title}</h3>
                  <p className="text-gray-600">{highlight.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">Join 50,000+ Happy Customers</h2>
          <p className="text-xl text-blue-100 mb-8">
            Start your journey with CraftCRM today and see why businesses across Pakistan and India trust us with their
            inventory management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              asChild
              className="bg-white text-blue-600 hover:bg-gray-100 px-10 py-4 text-lg font-semibold rounded-lg"
            >
              <Link href="/start-trial">
                <Zap className="w-5 h-5 mr-2" />
                Start Your Free Trial
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-10 py-4 text-lg font-semibold rounded-lg bg-transparent"
            >
              Read More Reviews
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
            <div>
              <NextLink href="/" className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white rounded-sm transform rotate-12"></div>
                      </div>
                      <span className="text-xl font-bold text-white">CraftCRM</span>
              </NextLink>
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
                  <span className="hover:text-white cursor-pointer">Contact Support</span>
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
                  <Link href="/reviews" className="hover:text-white">
                    Reviews
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
