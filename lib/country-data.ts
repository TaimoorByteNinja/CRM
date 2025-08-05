export interface CountryData {
  name: string
  code: string
  phoneCode: string
  currency: {
    code: string
    symbol: string
    name: string
    position: 'before' | 'after'
  }
  dateFormat: string
  numberFormat: string
  timezone: string
}

export const countries: CountryData[] = [
  {
    name: "India",
    code: "IN",
    phoneCode: "+91",
    currency: {
      code: "INR",
      symbol: "₹",
      name: "Indian Rupee",
      position: "before"
    },
    dateFormat: "DD/MM/YYYY",
    numberFormat: "en-IN",
    timezone: "Asia/Kolkata"
  },
  {
    name: "United States",
    code: "US",
    phoneCode: "+1",
    currency: {
      code: "USD",
      symbol: "$",
      name: "US Dollar",
      position: "before"
    },
    dateFormat: "MM/DD/YYYY",
    numberFormat: "en-US",
    timezone: "America/New_York"
  },
  {
    name: "United Kingdom",
    code: "GB",
    phoneCode: "+44",
    currency: {
      code: "GBP",
      symbol: "£",
      name: "British Pound",
      position: "before"
    },
    dateFormat: "DD/MM/YYYY",
    numberFormat: "en-GB",
    timezone: "Europe/London"
  },
  {
    name: "European Union",
    code: "EU",
    phoneCode: "+33",
    currency: {
      code: "EUR",
      symbol: "€",
      name: "Euro",
      position: "before"
    },
    dateFormat: "DD/MM/YYYY",
    numberFormat: "de-DE",
    timezone: "Europe/Berlin"
  },
  {
    name: "Canada",
    code: "CA",
    phoneCode: "+1",
    currency: {
      code: "CAD",
      symbol: "C$",
      name: "Canadian Dollar",
      position: "before"
    },
    dateFormat: "MM/DD/YYYY",
    numberFormat: "en-CA",
    timezone: "America/Toronto"
  },
  {
    name: "Australia",
    code: "AU",
    phoneCode: "+61",
    currency: {
      code: "AUD",
      symbol: "A$",
      name: "Australian Dollar",
      position: "before"
    },
    dateFormat: "DD/MM/YYYY",
    numberFormat: "en-AU",
    timezone: "Australia/Sydney"
  },
  {
    name: "Japan",
    code: "JP",
    phoneCode: "+81",
    currency: {
      code: "JPY",
      symbol: "¥",
      name: "Japanese Yen",
      position: "before"
    },
    dateFormat: "YYYY/MM/DD",
    numberFormat: "ja-JP",
    timezone: "Asia/Tokyo"
  },
  {
    name: "China",
    code: "CN",
    phoneCode: "+86",
    currency: {
      code: "CNY",
      symbol: "¥",
      name: "Chinese Yuan",
      position: "before"
    },
    dateFormat: "YYYY/MM/DD",
    numberFormat: "zh-CN",
    timezone: "Asia/Shanghai"
  },
  {
    name: "Singapore",
    code: "SG",
    phoneCode: "+65",
    currency: {
      code: "SGD",
      symbol: "S$",
      name: "Singapore Dollar",
      position: "before"
    },
    dateFormat: "DD/MM/YYYY",
    numberFormat: "en-SG",
    timezone: "Asia/Singapore"
  },
  {
    name: "United Arab Emirates",
    code: "AE",
    phoneCode: "+971",
    currency: {
      code: "AED",
      symbol: "د.إ",
      name: "UAE Dirham",
      position: "before"
    },
    dateFormat: "DD/MM/YYYY",
    numberFormat: "ar-AE",
    timezone: "Asia/Dubai"
  },
  {
    name: "Saudi Arabia",
    code: "SA",
    phoneCode: "+966",
    currency: {
      code: "SAR",
      symbol: "ر.س",
      name: "Saudi Riyal",
      position: "before"
    },
    dateFormat: "DD/MM/YYYY",
    numberFormat: "ar-SA",
    timezone: "Asia/Riyadh"
  },
  {
    name: "Pakistan",
    code: "PK",
    phoneCode: "+92",
    currency: {
      code: "PKR",
      symbol: "₨",
      name: "Pakistani Rupee",
      position: "before"
    },
    dateFormat: "DD/MM/YYYY",
    numberFormat: "en-PK",
    timezone: "Asia/Karachi"
  },
  {
    name: "Bangladesh",
    code: "BD",
    phoneCode: "+880",
    currency: {
      code: "BDT",
      symbol: "৳",
      name: "Bangladeshi Taka",
      position: "before"
    },
    dateFormat: "DD/MM/YYYY",
    numberFormat: "bn-BD",
    timezone: "Asia/Dhaka"
  },
  {
    name: "Sri Lanka",
    code: "LK",
    phoneCode: "+94",
    currency: {
      code: "LKR",
      symbol: "₨",
      name: "Sri Lankan Rupee",
      position: "before"
    },
    dateFormat: "DD/MM/YYYY",
    numberFormat: "si-LK",
    timezone: "Asia/Colombo"
  },
  {
    name: "Nepal",
    code: "NP",
    phoneCode: "+977",
    currency: {
      code: "NPR",
      symbol: "₨",
      name: "Nepalese Rupee",
      position: "before"
    },
    dateFormat: "DD/MM/YYYY",
    numberFormat: "ne-NP",
    timezone: "Asia/Kathmandu"
  },
  {
    name: "Brazil",
    code: "BR",
    phoneCode: "+55",
    currency: {
      code: "BRL",
      symbol: "R$",
      name: "Brazilian Real",
      position: "before"
    },
    dateFormat: "DD/MM/YYYY",
    numberFormat: "pt-BR",
    timezone: "America/Sao_Paulo"
  },
  {
    name: "Mexico",
    code: "MX",
    phoneCode: "+52",
    currency: {
      code: "MXN",
      symbol: "$",
      name: "Mexican Peso",
      position: "before"
    },
    dateFormat: "DD/MM/YYYY",
    numberFormat: "es-MX",
    timezone: "America/Mexico_City"
  },
  {
    name: "South Africa",
    code: "ZA",
    phoneCode: "+27",
    currency: {
      code: "ZAR",
      symbol: "R",
      name: "South African Rand",
      position: "before"
    },
    dateFormat: "DD/MM/YYYY",
    numberFormat: "en-ZA",
    timezone: "Africa/Johannesburg"
  },
  {
    name: "Nigeria",
    code: "NG",
    phoneCode: "+234",
    currency: {
      code: "NGN",
      symbol: "₦",
      name: "Nigerian Naira",
      position: "before"
    },
    dateFormat: "DD/MM/YYYY",
    numberFormat: "en-NG",
    timezone: "Africa/Lagos"
  },
  {
    name: "Egypt",
    code: "EG",
    phoneCode: "+20",
    currency: {
      code: "EGP",
      symbol: "E£",
      name: "Egyptian Pound",
      position: "before"
    },
    dateFormat: "DD/MM/YYYY",
    numberFormat: "ar-EG",
    timezone: "Africa/Cairo"
  }
]

export const getCountryByCode = (code: string): CountryData | undefined => {
  return countries.find(country => country.code === code)
}

export const getCountryByName = (name: string): CountryData | undefined => {
  return countries.find(country => country.name === name)
}

export const formatCurrency = (amount: number, currency: CountryData['currency'], locale: string = 'en-US') => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency.code,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export const formatCurrencyWithSymbol = (amount: number, currency: CountryData['currency']) => {
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
  
  if (currency.position === 'before') {
    return `${currency.symbol}${formatted}`
  } else {
    return `${formatted}${currency.symbol}`
  }
} 