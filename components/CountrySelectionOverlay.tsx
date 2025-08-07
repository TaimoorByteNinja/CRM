"use client"

import { useState, useEffect } from "react"
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks"
import { updateGeneralSettings, saveSettingsAsync } from "@/lib/store/slices/settingsSlice"
import { countries, CountryData, getCountryByCode } from "@/lib/country-data"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Globe, Check, ArrowRight } from "lucide-react"

interface CountrySelectionOverlayProps {
  isOpen: boolean
  onClose: () => void
}

export function CountrySelectionOverlay({ isOpen, onClose }: CountrySelectionOverlayProps) {
  const dispatch = useAppDispatch()
  const generalSettings = useAppSelector((state) => state.settings.general)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCountry, setSelectedCountry] = useState<CountryData | null>(null)
  const [phoneNumber, setPhoneNumber] = useState("")
  const [phoneError, setPhoneError] = useState("")

  // Force Pakistan as default on initial load
  useEffect(() => {
    const pakistanCountry = getCountryByCode('PK')
    if (pakistanCountry && !selectedCountry) {
      setSelectedCountry(pakistanCountry)
      setPhoneNumber(pakistanCountry.phoneCode)
    }
  }, [])

  useEffect(() => {
    // Set default country based on settings, or Pakistan if none selected
    let defaultCountry = getCountryByCode(generalSettings.selectedCountry)
    
    // If no country is selected or if it's still India, default to Pakistan
    if (!defaultCountry || generalSettings.selectedCountry === 'IN') {
      defaultCountry = getCountryByCode('PK') // Pakistan as default
    }
    
    if (defaultCountry) {
      setSelectedCountry(defaultCountry)
      // Use existing phone number from settings if available, otherwise use country code
      if (generalSettings.phoneNumber && generalSettings.phoneNumber.trim().length > 0) {
        setPhoneNumber(generalSettings.phoneNumber)
      } else {
        setPhoneNumber(defaultCountry.phoneCode)
      }
    }
  }, [generalSettings.selectedCountry, generalSettings.phoneNumber])

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    country.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleCountrySelect = (country: CountryData) => {
    setSelectedCountry(country)
    setPhoneNumber(country.phoneCode)
  }

  const handleSave = async () => {
    if (!selectedCountry) {
      return
    }
    
    // Validate phone number - must have more than just the country code
    const phoneWithoutCode = phoneNumber.replace(selectedCountry.phoneCode, '').trim()
    if (!phoneWithoutCode || phoneWithoutCode.length < 7) {
      setPhoneError("Please enter a valid phone number")
      return
    }
    
    setPhoneError("")
    
    if (selectedCountry) {
      const newSettings = {
        selectedCountry: selectedCountry.code,
        selectedNumberFormat: selectedCountry.numberFormat,
        selectedDateFormat: selectedCountry.dateFormat,
        selectedCurrency: selectedCountry.currency.code,
        selectedCurrencySymbol: selectedCountry.currency.symbol,
        businessCurrency: selectedCountry.currency.symbol,
        phoneNumber: phoneNumber,
      }
      
      // Update Redux store
      dispatch(updateGeneralSettings(newSettings))
      
      // Initialize user data management with phone number
      try {
        const { UserDataManager } = await import('@/lib/user-data-manager')
        
        console.log('🔄 Initializing user data management...')
        const result = await UserDataManager.initializeUserByPhone(phoneNumber)
        
        if (result.isNewUser) {
          console.log('✅ New user profile created!')
        } else {
          console.log('✅ Existing user data loaded!')
        }
        
        // Save to Supabase using the existing method
        await dispatch(saveSettingsAsync({
          general: {
            ...generalSettings,
            ...newSettings
          }
        })).unwrap()
        
        console.log('Settings saved to Supabase successfully')
      } catch (error) {
        console.error('Failed to initialize user or save settings:', error)
        // Still close the dialog even if there's an error
      }
      
      // Mark that user has completed the country selection
      localStorage.setItem('hasSeenCountrySelection', 'true')
      
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <div className="flex items-center gap-3">
            <Globe className="h-6 w-6" />
            <div>
              <CardTitle className="text-xl">Welcome to Craft CRM</CardTitle>
              <p className="text-blue-100 text-sm">Please select your country to get started</p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Panel - Country Selection */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Search Country</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search countries..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Select Your Country</Label>
                <div className="max-h-96 overflow-y-auto border rounded-lg">
                  {filteredCountries.map((country) => (
                    <div
                      key={country.code}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 transition-colors ${
                        selectedCountry?.code === country.code ? 'bg-blue-50 border-blue-200' : ''
                      }`}
                      onClick={() => handleCountrySelect(country)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {country.code}
                          </div>
                          <div>
                            <h4 className="font-medium">{country.name}</h4>
                            <p className="text-sm text-gray-600">
                              {country.currency.symbol} {country.currency.name}
                            </p>
                          </div>
                        </div>
                        {selectedCountry?.code === country.code && (
                          <Check className="h-5 w-5 text-blue-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Panel - Country Details */}
            <div className="space-y-6">
              {selectedCountry ? (
                <>
                  <div className="text-center">
                    <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                      {selectedCountry.code}
                    </div>
                    <h3 className="text-xl font-bold">{selectedCountry.name}</h3>
                    <p className="text-gray-600">Currency: {selectedCountry.currency.name}</p>
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Currency</Label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">
                            {selectedCountry.currency.symbol}
                          </div>
                          <div className="text-sm text-gray-600">
                            {selectedCountry.currency.name}
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Phone Code</Label>
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <div className="text-lg font-semibold">
                            {selectedCountry.phoneCode}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">
                        Phone Number <span className="text-red-500">*</span>
                      </Label>
                      <div className="flex">
                        <div className="px-3 py-2 bg-gray-100 border border-r-0 rounded-l-lg text-sm">
                          {selectedCountry.phoneCode}
                        </div>
                        <Input
                          value={phoneNumber.replace(selectedCountry.phoneCode, '')}
                          onChange={(e) => {
                            setPhoneNumber(selectedCountry.phoneCode + e.target.value)
                            setPhoneError("")
                          }}
                          placeholder="Enter your phone number"
                          className={`rounded-l-none ${phoneError ? 'border-red-500' : ''}`}
                          required
                        />
                      </div>
                      {phoneError && (
                        <p className="text-red-500 text-xs mt-1">{phoneError}</p>
                      )}
                      <p className="text-gray-500 text-xs">Phone number is required to continue</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Date Format</Label>
                        <div className="p-3 bg-gray-50 rounded-lg text-sm">
                          {selectedCountry.dateFormat}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Number Format</Label>
                        <div className="p-3 bg-gray-50 rounded-lg text-sm">
                          {selectedCountry.numberFormat}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-sm font-medium">Timezone</Label>
                      <div className="p-3 bg-gray-50 rounded-lg text-sm">
                        {selectedCountry.timezone}
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button 
                        onClick={handleSave} 
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500"
                        size="lg"
                        disabled={!selectedCountry || !phoneNumber.replace(selectedCountry.phoneCode, '').trim() || phoneNumber.replace(selectedCountry.phoneCode, '').trim().length < 7}
                      >
                        <ArrowRight className="h-4 w-4 mr-2" />
                        Continue with {selectedCountry.name}
                      </Button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <Globe className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-600">Select a country</h3>
                  <p className="text-sm text-gray-500">Choose your country from the list to see details</p>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 