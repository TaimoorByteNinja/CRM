"use client"

import { useState, useEffect } from "react"
import { CollapsibleSidebar } from "@/components/collapsible-sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  MoreHorizontal,
  Phone,
  Mail,
  MapPin,
  Building,
  CreditCard,
  User,
  Filter,
  Download,
  Upload,
  ArrowUpRight,
  Activity,
  Sparkles,
  TrendingUp,
  Building2,
  Eye,
  FileText,
  History,
  DollarSign,
  AlertCircle,
  CheckCircle,
  RefreshCw,
} from "lucide-react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { selectAllParties, selectPartiesLoading, fetchParties, createParty, updateParty, deleteParty, Party } from '@/lib/store/slices/partiesSlice';
import { selectGeneralSettings } from "@/lib/store/slices/settingsSlice"
import { showNotification } from "@/lib/store/slices/uiSlice"
import LoadingSpinner from "@/components/LoadingSpinner"
import LoadingState from "@/components/LoadingState"
import { useCurrency } from "@/lib/currency-manager"

interface LocalParty {
  id: string
  name: string
  type: "customer" | "supplier" | "both"
  phone: string
  email: string
  address: string
  city: string
  state: string
  pincode: string
  gstin?: string
  pan?: string
  creditLimit: number
  balance: number
  status: "active" | "inactive"
  createdAt: string
  updatedAt: string
  totalTransactions: number
  lastTransaction?: string
}

interface Transaction {
  id: string
  partyId: string
  type: "sale" | "purchase" | "payment" | "receipt"
  amount: number
  description: string
  date: string
  invoiceNumber?: string
  status: "pending" | "completed" | "cancelled"
}

export default function PartiesPage() {
  const dispatch = useAppDispatch()
  const generalSettings = useAppSelector(selectGeneralSettings)
  const parties = useAppSelector(selectAllParties)
  const partiesLoading = useAppSelector(selectPartiesLoading)
  const { formatAmountWithSymbol, getSymbol } = useCurrency()
  
  const [activeTab, setActiveTab] = useState("parties")
  const [tabValue, setTabValue] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedType, setSelectedType] = useState("all")
  const [selectedStatus, setSelectedStatus] = useState("all")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showViewDialog, setShowViewDialog] = useState(false)
  const [showTransactionDialog, setShowTransactionDialog] = useState(false)
  const [selectedParty, setSelectedParty] = useState<Party | null>(null)
  const [viewParty, setViewParty] = useState<Party | null>(null)
  const [transactionParty, setTransactionParty] = useState<Party | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [deletingPartyId, setDeletingPartyId] = useState<string | null>(null)
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [formData, setFormData] = useState<Partial<Party>>({})
  const [transactionForm, setTransactionForm] = useState({
    type: "sale" as "sale" | "purchase" | "payment" | "receipt",
    amount: 0,
    description: "",
    invoiceNumber: "",
  })
  
  // Use parties directly from the store
  const partiesList: Party[] = parties

  // Fetch parties on component mount
  useEffect(() => {
    // Only fetch parties if phone number is available
    if (generalSettings.phoneNumber && generalSettings.phoneNumber.trim() !== '') {
      console.log('📱 Phone number available, fetching parties...')
      dispatch(fetchParties({}))
    } else {
      console.log('⏳ Waiting for phone number before fetching parties...')
    }
  }, [dispatch, generalSettings.phoneNumber])

  // Ensure component re-renders when country/currency changes
  useEffect(() => {
    // This effect will trigger when generalSettings.selectedCountry changes
    // The useCurrency hook will automatically pick up the new country and update currency formatting
    console.log('Country changed in parties page:', generalSettings.selectedCountry)
  }, [generalSettings.selectedCountry])

  const filteredParties = partiesList.filter((party) => {
    const matchesSearch =
      (party.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (party.phone || '').includes(searchTerm) ||
      (party.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (party.gstin || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = selectedType === "all" || party.type === selectedType
    const matchesStatus = selectedStatus === "all" || party.status === selectedStatus
    const matchesTab = tabValue === "all" || party.type === tabValue
    return matchesSearch && matchesType && matchesStatus && matchesTab
  })

  const customerParties = partiesList.filter((p) => p.type === "customer" || p.type === "both")
  const supplierParties = partiesList.filter((p) => p.type === "supplier" || p.type === "both")
  const totalReceivable = customerParties.reduce((sum, p) => sum + Math.max(0, p.balance), 0)
  const totalPayable = supplierParties.reduce((sum, p) => sum + Math.max(0, -p.balance), 0)
  const activeParties = partiesList.filter((p) => p.status === "active").length
  const inactiveParties = partiesList.filter((p) => p.status === "inactive").length

  const openDialog = (party?: Party) => {
    setSelectedParty(party || null)
    setFormData(party || { type: "customer", status: "active", creditLimit: 0, balance: 0 })
    setShowAddDialog(true)
  }

  const closeDialog = () => {
    setShowAddDialog(false)
    setSelectedParty(null)
    setFormData({})
  }

  const handleViewParty = (party: Party) => {
    setViewParty(party)
    setShowViewDialog(true)
  }

  const handleAddTransaction = (party: Party) => {
    setTransactionParty(party)
    setTransactionForm({
      type: party.type === "supplier" ? "purchase" : "sale",
      amount: 0,
      description: "",
      invoiceNumber: "",
    })
    setShowTransactionDialog(true)
  }

  const handleSave = async () => {
    setIsLoading(true)
    try {
      if (selectedParty) {
        // Update existing party
        const updatedParty = {
          ...formData,
          updatedAt: new Date().toISOString(),
        }
        await dispatch(updateParty({ id: selectedParty.id, updates: updatedParty })).unwrap()
        dispatch(showNotification({ message: "Party updated successfully!", type: "success" }))
      } else {
        // Create new party - use the structure expected by createParty
        const newParty: Omit<Party, 'id' | 'created_at' | 'updated_at'> = {
          party_name: formData.name || '',
          name: formData.name || '',
          party_type: formData.type || 'customer',
          type: formData.type || 'customer',
          contact_person: formData.contact_person || '',
          phone: formData.phone || '',
          email: formData.email || '',
          address: formData.address || '',
          city: formData.city || '',
          state: formData.state || '',
          pincode: formData.pincode || '',
          gstin: formData.gstin,
          pan: formData.pan,
          opening_balance: formData.balance || 0,
          current_balance: formData.balance || 0,
          credit_limit: formData.creditLimit || 0,
          creditLimit: formData.creditLimit || 0,
          balance: formData.balance || 0,
          payment_terms: 0,
          is_active: (formData.status || 'active') === 'active',
          status: (formData.status || 'active') as 'active' | 'inactive',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          totalTransactions: 0,
          lastTransaction: formData.lastTransaction,
        }
        await dispatch(createParty(newParty)).unwrap()
        dispatch(showNotification({ message: "Party added successfully!", type: "success" }))
      }
      closeDialog()
    } catch (error) {
      console.error("Failed to save:", error)
      dispatch(showNotification({ message: "Failed to save party", type: "error" }))
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveTransaction = async () => {
    if (!transactionParty) return
    setIsLoading(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        partyId: transactionParty.id,
        ...transactionForm,
        date: new Date().toISOString(),
        status: "completed",
      }
      setTransactions((prev) => [...prev, newTransaction])

      // Note: Party balance updates would need to be handled through Redux
      // For now, we'll just add the transaction to local state
      dispatch(showNotification({ message: "Transaction added successfully!", type: "success" }))

      setShowTransactionDialog(false)
      setTransactionParty(null)
      setTransactionForm({ type: "sale", amount: 0, description: "", invoiceNumber: "" })
    } catch (error) {
      console.error("Failed to save transaction:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this party?")) return
    setDeletingPartyId(id)
    try {
      await dispatch(deleteParty(id)).unwrap()
      dispatch(showNotification({ message: "Party deleted successfully!", type: "success" }))
    } catch (error) {
      console.error("Failed to delete:", error)
      dispatch(showNotification({ message: "Failed to delete party", type: "error" }))
    } finally {
      setDeletingPartyId(null)
    }
  }

  const handleExportParties = () => {
    const csvContent =
      "data:text/csv;charset=utf-8," +
      "Name,Type,Phone,Email,City,State,GSTIN,Balance,Credit Limit,Status\n" +
      filteredParties
        .map(
          (party) =>
            `${party.name},${party.type},${party.phone},${party.email},${party.city},${party.state},${party.gstin || ""},${party.balance},${party.creditLimit},${party.status}`,
        )
        .join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", "parties.csv")
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getPartyTypeIcon = (type: string) => {
    switch (type) {
      case "customer":
        return <User className="h-4 w-4 text-green-600" />
      case "supplier":
        return <Building className="h-4 w-4 text-blue-600" />
      case "both":
        return <Users className="h-4 w-4 text-purple-600" />
      default:
        return <User className="h-4 w-4 text-gray-600" />
    }
  }

  // Use Redux-connected currency formatting instead of hardcoded INR
  const formatCurrency = (amount: number) => {
    return formatAmountWithSymbol(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getPartyTransactions = (partyId: string) => {
    return transactions.filter((t) => t.partyId === partyId)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative">

      {/* Collapsible Sidebar */}
      <CollapsibleSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Loading Overlay */}
      {/* Removed spinner overlay as per user request */}

      {/* Main Content */}
      <div className="ml-16 flex flex-col min-h-screen">
        {/* Enhanced Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-white/20 shadow-lg sticky top-0 z-30">
          <div className="px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Users className="h-4 w-4 text-white" />
                    </div>
                    Parties (Customers & Suppliers)
                  </h1>
                  <p className="text-gray-600">Manage your customers and suppliers</p>
                </div>
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
                  <div className="relative bg-white rounded-xl p-1">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      className="pl-12 pr-4 py-3 w-96 bg-gray-50/50 border-gray-200/50 rounded-lg focus:bg-white transition-all duration-200"
                      placeholder="Search Parties"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                {/* <Button className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Sale
                </Button>
                <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Purchase
                </Button> */}
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-200 bg-transparent"
                >
                  <Plus className="h-4 w-4" />
                </Button>
                {/* Refresh Button */}
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-200 bg-transparent flex items-center"
                  onClick={() => dispatch(fetchParties({}))}
                  disabled={partiesLoading}
                  title="Refresh"
                >
                  <RefreshCw className={`h-4 w-4 mr-1 ${partiesLoading ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-200 bg-transparent"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="bg-white/95 backdrop-blur-xl border-white/20">
                    <DropdownMenuItem onClick={handleExportParties}>
                      <Download className="h-4 w-4 mr-2" />
                      Export Parties
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Upload className="h-4 w-4 mr-2" />
                      Import Parties
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 p-8">
          <Tabs value={tabValue} onValueChange={setTabValue} className="space-y-8">
            <TabsList className="grid w-full grid-cols-3 bg-white/70 backdrop-blur-xl border-white/20 shadow-lg rounded-2xl p-2">
              <TabsTrigger
                value="all"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
              >
                All Parties ({partiesList.length})
              </TabsTrigger>
              <TabsTrigger
                value="customer"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
              >
                Customers ({partiesList.filter(p => p.type === 'customer').length})
              </TabsTrigger>
              <TabsTrigger
                value="supplier"
                className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-600 data-[state=active]:text-white data-[state=active]:shadow-lg transition-all duration-200"
              >
                Suppliers ({partiesList.filter(p => p.type === 'supplier').length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={tabValue} className="space-y-8">
              {/* Enhanced Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {partiesLoading ? (
                  <LoadingState type="cards" rows={5} className="col-span-full" />
                ) : (
                  <>
                    <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">Total Parties</p>
                            <p className="text-2xl font-bold text-gray-900">{partiesList.length}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <ArrowUpRight className="h-3 w-3 text-blue-500" />
                              {activeParties} active
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                            <Users className="h-6 w-6 text-blue-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">Customers</p>
                            <p className="text-2xl font-bold text-gray-900">{partiesList.filter(p => p.type === 'customer').length}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <TrendingUp className="h-3 w-3 text-green-500" />
                              Revenue source
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                            <User className="h-6 w-6 text-green-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">Suppliers</p>
                            <p className="text-2xl font-bold text-gray-900">{partiesList.filter(p => p.type === 'supplier').length}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <Building2 className="h-3 w-3 text-purple-500" />
                              Supply chain
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-violet-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                            <Building className="h-6 w-6 text-purple-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">Receivable</p>
                            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalReceivable)}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <ArrowUpRight className="h-3 w-3 text-green-500" />
                              From customers
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-emerald-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                            <DollarSign className="h-6 w-6 text-green-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-lg hover:shadow-xl transition-all duration-300 group">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-600 mb-2">Payable</p>
                            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalPayable)}</p>
                            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                              <Activity className="h-3 w-3 text-red-500" />
                              To suppliers
                            </p>
                          </div>
                          <div className="w-12 h-12 bg-gradient-to-br from-red-100 to-pink-100 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                            <CreditCard className="h-6 w-6 text-red-600" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </div>

              {/* Enhanced Filters and Actions */}
              {partiesLoading ? (
                <LoadingState type="skeleton" rows={1} className="flex items-center justify-between" />
              ) : (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Select value={selectedType} onValueChange={setSelectedType}>
                    <SelectTrigger className="w-48 rounded-xl border-gray-200 bg-white/50 backdrop-blur-xl">
                      <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-xl border-white/20">
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="customer">Customers</SelectItem>
                      <SelectItem value="supplier">Suppliers</SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger className="w-48 rounded-xl border-gray-200 bg-white/50 backdrop-blur-xl">
                      <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent className="bg-white/95 backdrop-blur-xl border-white/20">
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    className="rounded-xl border-gray-200 hover:bg-gray-50 transition-all duration-200 bg-white/50 backdrop-blur-xl"
                  >
                    <Filter className="h-4 w-4 mr-2" />
                    More Filters
                  </Button>
                </div>
                <Button
                  onClick={() => openDialog()}
                  className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Party
                </Button>
              </div>
              )}

              {/* Enhanced Parties Table */}
              {partiesLoading ? (
                <LoadingState type="table" rows={5} columns={8} className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl rounded-lg" />
              ) : (
                <Card className="bg-white/70 backdrop-blur-xl border-white/20 shadow-xl hover:shadow-2xl transition-all duration-300">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-gray-900">Parties ({filteredParties.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Party Details</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>Contact</TableHead>
                          <TableHead>Location</TableHead>
                          <TableHead>Balance</TableHead>
                          <TableHead>Credit Limit</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredParties.map((party) => (
                          <TableRow key={party.id} className="hover:bg-gray-50/50 transition-colors">
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                                  <span className="text-white font-semibold text-sm">
                                    {(party.name || 'Unknown')
                                      .split(" ")
                                      .map((n: string) => n[0])
                                      .join("")
                                      .slice(0, 2)
                                      .toUpperCase()}
                                  </span>
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">{party.name}</p>
                                  {party.gstin && <p className="text-sm text-gray-600">GSTIN: {party.gstin}</p>}
                                  <p className="text-xs text-gray-500">{party.totalTransactions} transactions</p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getPartyTypeIcon(party.type)}
                                <Badge
                                  className={
                                    party.type === "customer"
                                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                                      : party.type === "supplier"
                                        ? "bg-blue-100 text-blue-800 hover:bg-blue-100"
                                        : "bg-purple-100 text-purple-800 hover:bg-purple-100"
                                  }
                                >
                                  {party.type}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3 text-gray-400" />
                                  <span className="text-sm">{party.phone}</span>
                                </div>
                                {party.email && (
                                  <div className="flex items-center gap-1">
                                    <Mail className="h-3 w-3 text-gray-400" />
                                    <span className="text-sm">{party.email}</span>
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <MapPin className="h-3 w-3 text-gray-400" />
                                <span className="text-sm">
                                  {party.city}, {party.state}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span
                                  className={
                                    party.balance >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"
                                  }
                                >
                                  {formatCurrency(party.balance)}
                                </span>
                                {party.balance > 0 && <ArrowUpRight className="h-3 w-3 text-green-500" />}
                                {party.balance < 0 && <AlertCircle className="h-3 w-3 text-red-500" />}
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">{formatCurrency(party.creditLimit)}</TableCell>
                            <TableCell>
                              <Badge
                                className={
                                  party.status === "active"
                                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                                    : "bg-gray-100 text-gray-800 hover:bg-gray-100"
                                }
                              >
                                {party.status === "active" ? (
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                ) : (
                                  <AlertCircle className="h-3 w-3 mr-1" />
                                )}
                                {party.status}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Button
                                  onClick={() => handleViewParty(party)}
                                  size="sm"
                                  variant="ghost"
                                  className="hover:bg-green-50 hover:text-green-600"
                                  title="View Details"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleAddTransaction(party)}
                                  size="sm"
                                  variant="ghost"
                                  className="hover:bg-purple-50 hover:text-purple-600"
                                  title="Add Transaction"
                                >
                                  <CreditCard className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => openDialog(party)}
                                  size="sm"
                                  variant="ghost"
                                  className="hover:bg-blue-50 hover:text-blue-600"
                                  title="Edit Party"
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={() => handleDelete(party.id)}
                                  size="sm"
                                  variant="ghost"
                                  disabled={deletingPartyId === party.id}
                                  className="hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                                  title="Delete Party"
                                >
                                  {deletingPartyId === party.id ? (
                                    <LoadingSpinner size="sm" text="" className="text-red-600" />
                                  ) : (
                                    <Trash2 className="h-4 w-4" />
                                  )}
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Enhanced Add/Edit Party Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-white/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              {selectedParty ? "Edit Party" : "Add New Party"}
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              {selectedParty ? "Update the party details below" : "Fill in the party details below"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                  Party Name *
                </Label>
                <Input
                  id="name"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={formData.name || ""}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter party name"
                />
              </div>
              <div>
                <Label htmlFor="type" className="text-sm font-medium text-gray-700">
                  Party Type *
                </Label>
                <Select
                  value={formData.type || ""}
                  onValueChange={(value: "customer" | "supplier" | "both") => setFormData({ ...formData, type: value })}
                >
                  <SelectTrigger className="mt-1 rounded-lg border-gray-200">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="customer">Customer</SelectItem>
                    <SelectItem value="supplier">Supplier</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                  Phone Number *
                </Label>
                <Input
                  id="phone"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={formData.phone || ""}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 9876543210"
                />
              </div>
              <div>
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={formData.email || ""}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="email@example.com"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                Address
              </Label>
              <Textarea
                id="address"
                className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                value={formData.address || ""}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Enter full address"
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="city" className="text-sm font-medium text-gray-700">
                  City
                </Label>
                <Input
                  id="city"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={formData.city || ""}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="City"
                />
              </div>
              <div>
                <Label htmlFor="state" className="text-sm font-medium text-gray-700">
                  State
                </Label>
                <Input
                  id="state"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={formData.state || ""}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  placeholder="State"
                />
              </div>
              <div>
                <Label htmlFor="pincode" className="text-sm font-medium text-gray-700">
                  Pincode
                </Label>
                <Input
                  id="pincode"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={formData.pincode || ""}
                  onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                  placeholder="123456"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gstin" className="text-sm font-medium text-gray-700">
                  GSTIN
                </Label>
                <Input
                  id="gstin"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={formData.gstin || ""}
                  onChange={(e) => setFormData({ ...formData, gstin: e.target.value })}
                  placeholder="27ABCDE1234F1Z5"
                />
              </div>
              <div>
                <Label htmlFor="pan" className="text-sm font-medium text-gray-700">
                  PAN
                </Label>
                <Input
                  id="pan"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={formData.pan || ""}
                  onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                  placeholder="ABCDE1234F"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="creditLimit" className="text-sm font-medium text-gray-700">
                  Credit Limit ({getSymbol()})
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    {getSymbol()}
                  </div>
                  <Input
                    id="creditLimit"
                    type="number"
                    className="mt-1 pl-8 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                    value={formData.creditLimit || ""}
                    onChange={(e) => setFormData({ ...formData, creditLimit: Number.parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="balance" className="text-sm font-medium text-gray-700">
                  Opening Balance ({getSymbol()})
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                    {getSymbol()}
                  </div>
                  <Input
                    id="balance"
                    type="number"
                    className="mt-1 pl-8 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                    value={formData.balance || ""}
                    onChange={(e) => setFormData({ ...formData, balance: Number.parseFloat(e.target.value) || 0 })}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
            <div>
              <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                Status
              </Label>
              <Select
                value={formData.status || ""}
                onValueChange={(value: "active" | "inactive") => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="mt-1 rounded-lg border-gray-200">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={closeDialog}
              className="rounded-lg border-gray-300 hover:bg-gray-50 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || !formData.name || !formData.phone}
              className="bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" text="" className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  {selectedParty ? "Update" : "Save"}
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* View Party Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-white/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Party Details
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Complete information about {viewParty?.name}
            </DialogDescription>
          </DialogHeader>
          {viewParty && (
            <div className="space-y-6">
              {/* Party Info */}
              <div className="grid grid-cols-2 gap-6">
                <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold">
                          {viewParty.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900">{viewParty.name}</h3>
                        <Badge
                          className={
                            viewParty.type === "customer"
                              ? "bg-green-100 text-green-800"
                              : viewParty.type === "supplier"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-purple-100 text-purple-800"
                          }
                        >
                          {viewParty.type}
                        </Badge>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{viewParty.phone}</span>
                      </div>
                      {viewParty.email && (
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-gray-400" />
                          <span>{viewParty.email}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{viewParty.address}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-gray-900 mb-3">Financial Summary</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Current Balance:</span>
                        <span className={`font-medium ${viewParty.balance >= 0 ? "text-green-600" : "text-red-600"}`}>
                          {formatCurrency(viewParty.balance)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Credit Limit:</span>
                        <span className="font-medium">{formatCurrency(viewParty.creditLimit)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Transactions:</span>
                        <span className="font-medium">{viewParty.totalTransactions}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Last Transaction:</span>
                        <span className="font-medium">
                          {viewParty.lastTransaction ? formatDate(viewParty.lastTransaction) : "None"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Business Details */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Business Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">GSTIN</Label>
                      <p className="text-sm text-gray-900">{viewParty.gstin || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">PAN</Label>
                      <p className="text-sm text-gray-900">{viewParty.pan || "Not provided"}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">City</Label>
                      <p className="text-sm text-gray-900">{viewParty.city}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">State</Label>
                      <p className="text-sm text-gray-900">{viewParty.state}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Pincode</Label>
                      <p className="text-sm text-gray-900">{viewParty.pincode}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-gray-700">Status</Label>
                      <Badge
                        className={
                          viewParty.status === "active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }
                      >
                        {viewParty.status}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Transactions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <History className="h-5 w-5" />
                    Recent Transactions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {getPartyTransactions(viewParty.id).length > 0 ? (
                    <div className="space-y-3">
                      {getPartyTransactions(viewParty.id)
                        .slice(0, 5)
                        .map((transaction) => (
                          <div
                            key={transaction.id}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                  transaction.type === "sale"
                                    ? "bg-green-100"
                                    : transaction.type === "purchase"
                                      ? "bg-blue-100"
                                      : "bg-purple-100"
                                }`}
                              >
                                {transaction.type === "sale" ? "↗" : transaction.type === "purchase" ? "↙" : "💰"}
                              </div>
                              <div>
                                <p className="font-medium text-sm">{transaction.description}</p>
                                <p className="text-xs text-gray-600">{formatDate(transaction.date)}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p
                                className={`font-medium ${
                                  transaction.type === "sale" || transaction.type === "receipt"
                                    ? "text-green-600"
                                    : "text-red-600"
                                }`}
                              >
                                {transaction.type === "sale" || transaction.type === "receipt" ? "+" : "-"}
                                {formatCurrency(transaction.amount)}
                              </p>
                              <Badge variant="outline" className="text-xs">
                                {transaction.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                      <p>No transactions found</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowViewDialog(false)}
                  className="rounded-lg border-gray-300 hover:bg-gray-50"
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    setShowViewDialog(false)
                    openDialog(viewParty)
                  }}
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-lg"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Party
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Transaction Dialog */}
      <Dialog open={showTransactionDialog} onOpenChange={setShowTransactionDialog}>
        <DialogContent className="max-w-lg bg-white/95 backdrop-blur-xl border-white/20">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
              Add Transaction
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              Add a new transaction for {transactionParty?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="transactionType" className="text-sm font-medium text-gray-700">
                Transaction Type
              </Label>
              <Select
                value={transactionForm.type}
                onValueChange={(value: "sale" | "purchase" | "payment" | "receipt") =>
                  setTransactionForm({ ...transactionForm, type: value })
                }
              >
                <SelectTrigger className="mt-1 rounded-lg border-gray-200">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sale">Sale</SelectItem>
                  <SelectItem value="purchase">Purchase</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="receipt">Receipt</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                Amount ({getSymbol()})
              </Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm">
                  {getSymbol()}
                </div>
                <Input
                  id="amount"
                  type="number"
                  className="mt-1 pl-8 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                  value={transactionForm.amount}
                  onChange={(e) =>
                    setTransactionForm({ ...transactionForm, amount: Number.parseFloat(e.target.value) || 0 })
                  }
                  placeholder="0.00"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-700">
                Description
              </Label>
              <Input
                id="description"
                className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                value={transactionForm.description}
                onChange={(e) => setTransactionForm({ ...transactionForm, description: e.target.value })}
                placeholder="Transaction description"
              />
            </div>
            <div>
              <Label htmlFor="invoiceNumber" className="text-sm font-medium text-gray-700">
                Invoice/Reference Number
              </Label>
              <Input
                id="invoiceNumber"
                className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                value={transactionForm.invoiceNumber}
                onChange={(e) => setTransactionForm({ ...transactionForm, invoiceNumber: e.target.value })}
                placeholder="INV-2024-001"
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => setShowTransactionDialog(false)}
              className="rounded-lg border-gray-300 hover:bg-gray-50 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveTransaction}
              disabled={isLoading || !transactionForm.amount || !transactionForm.description}
              className="bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              {isLoading ? (
                <>
                  <LoadingSpinner size="sm" text="" className="mr-2" />
                  Saving...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Add Transaction
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
