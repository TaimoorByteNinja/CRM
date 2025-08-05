console.log('=== DEBUGGING PHONE PARAMETER ===')
console.log('localStorage currentUserPhone:', localStorage.getItem('currentUserPhone'))

// Test the API client getCurrentUserPhone function directly
function getCurrentUserPhoneTest() {
  if (typeof window === 'undefined') return null;
  
  try {
    const phoneFromStorage = localStorage.getItem('currentUserPhone');
    if (phoneFromStorage) return phoneFromStorage;
    return null;
  } catch (error) {
    console.error('Error getting current user phone:', error);
    return null;
  }
}

console.log('getCurrentUserPhone test result:', getCurrentUserPhoneTest())

// Test the addPhoneParam function
function addPhoneParamTest(url, phone) {
  const phoneNumber = phone || getCurrentUserPhoneTest();
  if (!phoneNumber) return url;
  
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}phone=${encodeURIComponent(phoneNumber)}`;
}

console.log('addPhoneParam test for items API:', addPhoneParamTest('/api/business-hub/items'))
console.log('addPhoneParam test for parties API:', addPhoneParamTest('/api/business-hub/parties'))

console.log('=== END DEBUG ===')

// Export to global for testing
window.debugPhone = {
  getCurrentUserPhoneTest,
  addPhoneParamTest
}
