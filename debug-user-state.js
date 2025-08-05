// Debug script to check localStorage and current user state
console.log('=== USER STATE DEBUG ===')
console.log('localStorage currentUserPhone:', localStorage.getItem('currentUserPhone'))

// Check if we can access the Redux store
if (window.__REDUX_STORE__) {
  const state = window.__REDUX_STORE__.getState()
  console.log('Redux general settings:', state.settings.general)
  console.log('Phone number from Redux:', state.settings.general.phoneNumber)
} else {
  console.log('Redux store not accessible from window')
}

// Test API client getCurrentUserPhone function
if (window.apiClient) {
  console.log('API client available')
} else {
  console.log('API client not available from window')
}

console.log('=== END DEBUG ===')
