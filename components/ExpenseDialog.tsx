"use client"

import { useState, useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Sparkles, Search, User, Building } from "lucide-react"
import { useAppDispatch, useAppSelector } from "@/lib/store/hooks"
import { createExpense, updateExpense, Expense } from "@/lib/store/slices/expensesSlice"
import { selectAllParties, fetchParties } from "@/lib/store/slices/partiesSlice"
import { showNotification } from "@/lib/store/slices/uiSlice"

interface ExpenseDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  expenseToEdit?: Expense
}

export default function ExpenseDialog({ open, onOpenChange, expenseToEdit }: ExpenseDialogProps) {
  const dispatch = useAppDispatch()
  const parties = useAppSelector(selectAllParties)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [showPartySearch, setShowPartySearch] = useState(false)
  const [partySearchTerm, setPartySearchTerm] = useState("")
  const [selectedParty, setSelectedParty] = useState<any>(null)

  // Filter parties for expense purposes (suppliers, customers, or both) - use useMemo to prevent infinite re-renders
  const availableParties = useMemo(() => 
    parties.filter(party => party.type === 'supplier' || party.type === 'customer' || party.type === 'both'),
    [parties]
  )

  useEffect(() => {
    if (expenseToEdit) {
      setFormData({
        expense_number: expenseToEdit.expense_number || '',
        date: expenseToEdit.date || '',
        category: expenseToEdit.category || '',
        description: expenseToEdit.description || '',
        amount: expenseToEdit.amount || 0,
        status: expenseToEdit.status || 'paid',
        notes: expenseToEdit.notes || '',
        party_id: expenseToEdit.party_id || '',
      });
      // Set selected party if editing
      if (expenseToEdit.party_id) {
        const party = availableParties.find(p => p.id === expenseToEdit.party_id)
        setSelectedParty(party || null)
      }
    } else {
      setFormData({
        expense_number: '',
        date: new Date().toISOString().split('T')[0],
        category: '',
        description: '',
        amount: 0,
        status: 'paid',
        notes: '',
        party_id: '',
      });
      setSelectedParty(null)
    }
  }, [expenseToEdit, open, availableParties]);

  // Fetch parties when dialog opens
  useEffect(() => {
    if (open) {
      dispatch(fetchParties())
    }
  }, [open, dispatch])

  const handlePartySelect = (party: any) => {
    setSelectedParty(party)
    setFormData(prev => ({ ...prev, party_id: party.id }))
    setShowPartySearch(false)
    setPartySearchTerm("")
  }

  const filteredParties = useMemo(() => 
    availableParties.filter(party =>
      party.name.toLowerCase().includes(partySearchTerm.toLowerCase()) ||
      party.phone.includes(partySearchTerm) ||
      party.email.toLowerCase().includes(partySearchTerm.toLowerCase())
    ),
    [availableParties, partySearchTerm]
  )

  const handleSave = async () => {
    setIsLoading(true);
    try {
      if (expenseToEdit) {
        await dispatch(updateExpense({ id: expenseToEdit.id, expense: formData })).unwrap();
        dispatch(showNotification({ message: "Expense updated successfully!", type: "success" }));
      } else {
        await dispatch(createExpense(formData)).unwrap();
        dispatch(showNotification({ message: "Expense created successfully!", type: "success" }));
      }
      onOpenChange(false);
    } catch (error) {
      dispatch(showNotification({ message: "Failed to save expense", type: "error" }));
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const getPartyTypeIcon = (type: string) => {
    switch (type) {
      case "customer":
        return <User className="h-4 w-4 text-green-600" />
      case "supplier":
        return <Building className="h-4 w-4 text-blue-600" />
      case "both":
        return <User className="h-4 w-4 text-purple-600" />
      default:
        return <User className="h-4 w-4 text-gray-600" />
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white/95 backdrop-blur-xl border-white/20">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
            {expenseToEdit ? "Edit Expense" : "Create New Expense"}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {expenseToEdit
              ? "Update the expense details below"
              : "Fill in the expense details below"}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-6">
          {/* Expense Number and Party Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expense_number" className="text-sm font-medium text-gray-700">
                Expense Number *
              </Label>
              <Input
                id="expense_number"
                className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                value={formData.expense_number || ""}
                onChange={(e) => setFormData({ ...formData, expense_number: e.target.value })}
                placeholder="Enter expense number"
              />
            </div>
            <div className="relative">
              <Label htmlFor="party" className="text-sm font-medium text-gray-700">
                Related Party
              </Label>
              <div className="relative">
                <Input
                  id="party"
                  className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors pr-10"
                  value={selectedParty ? selectedParty.name : ""}
                  onChange={(e) => {
                    setPartySearchTerm(e.target.value)
                    setShowPartySearch(true)
                  }}
                  onFocus={() => setShowPartySearch(true)}
                  placeholder="Search and select party"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
                  onClick={() => setShowPartySearch(!showPartySearch)}
                >
                  <Search className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Party Search Dropdown */}
              {showPartySearch && (
                <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                  <div className="p-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Select Party</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowPartySearch(false)}
                        className="h-6 w-6 p-0"
                      >
                        ×
                      </Button>
                    </div>
                    {filteredParties.length > 0 ? (
                      filteredParties.map((party) => (
                        <div
                          key={party.id}
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                          onClick={() => handlePartySelect(party)}
                        >
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs font-semibold">
                              {party.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-sm">{party.name}</p>
                              {getPartyTypeIcon(party.type)}
                            </div>
                            <p className="text-xs text-gray-600">{party.phone}</p>
                            {party.email && <p className="text-xs text-gray-600">{party.email}</p>}
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-gray-600">Balance: {formatCurrency(party.balance)}</p>
                            <p className="text-xs text-gray-500">{party.city}, {party.state}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-4 text-gray-500">
                        <User className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                        <p className="text-sm">No parties found</p>
                        <p className="text-xs">Add parties in the Parties section</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Selected Party Info */}
          {selectedParty && (
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-amber-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-semibold text-sm">
                      {selectedParty.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-gray-900">{selectedParty.name}</p>
                      {getPartyTypeIcon(selectedParty.type)}
                    </div>
                    <p className="text-sm text-gray-600">{selectedParty.phone}</p>
                    {selectedParty.email && <p className="text-sm text-gray-600">{selectedParty.email}</p>}
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">Current Balance</p>
                  <p className={`text-lg font-bold ${selectedParty.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrency(selectedParty.balance)}
                  </p>
                  <p className="text-xs text-gray-600">Credit Limit: {formatCurrency(selectedParty.creditLimit)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Date and Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="date" className="text-sm font-medium text-gray-700">
                Date
              </Label>
              <Input
                id="date"
                type="date"
                className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                value={formData.date || ""}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="category" className="text-sm font-medium text-gray-700">
                Category
              </Label>
              <Select
                value={formData.category || ""}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger className="mt-1 rounded-lg border-gray-200">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="office">Office Supplies</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="utilities">Utilities</SelectItem>
                  <SelectItem value="rent">Rent</SelectItem>
                  <SelectItem value="salary">Salary</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Amount and Status */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount" className="text-sm font-medium text-gray-700">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
                value={formData.amount || ""}
                onChange={(e) => setFormData({ ...formData, amount: Number.parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="status" className="text-sm font-medium text-gray-700">
                Status
              </Label>
              <Select
                value={formData.status || ""}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger className="mt-1 rounded-lg border-gray-200">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium text-gray-700">
              Description
            </Label>
            <Input
              id="description"
              className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
              value={formData.description || ""}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description"
            />
          </div>

          <div>
            <Label htmlFor="notes" className="text-sm font-medium text-gray-700">
              Notes
            </Label>
            <Textarea
              id="notes"
              className="mt-1 rounded-lg border-gray-200 focus:border-blue-500 transition-colors"
              value={formData.notes || ""}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="rounded-lg border-gray-300 hover:bg-gray-50 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={isLoading || !formData.expense_number}
              className="bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              {isLoading ? "Saving..." : expenseToEdit ? "Update Expense" : "Create Expense"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 