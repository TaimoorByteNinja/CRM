// Debug script to test sales API
const testSalesAPI = async () => {
  const phone = encodeURIComponent('+923034091907');
  const url = `http://localhost:3000/api/business-hub/sales?phone=${phone}`;
  
  console.log('Testing URL:', url);
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    console.log('Response status:', response.status);
    console.log('Sales data:', JSON.stringify(data, null, 2));
    
    if (data.length > 0) {
      console.log('First sale items:', data[0].items);
      console.log('First sale sale_data:', data[0].sale_data);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

testSalesAPI();
