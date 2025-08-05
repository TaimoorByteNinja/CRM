// Debug script to test sale conversion
const testData = {
  "items": [
    {
      "price": 2000,
      "total": 2000,
      "itemId": "3d2ece3e-f2c0-45a8-8f9b-7f3339e051d8",
      "item_id": "3d2ece3e-f2c0-45a8-8f9b-7f3339e051d8",
      "discount": 0,
      "itemName": "Nail ",
      "quantity": 1,
      "tax_rate": 8,
      "item_name": "Nail ",
      "tax_amount": 160,
      "unit_price": 2000,
      "total_amount": 2000,
      "discount_amount": 0
    }
  ]
};

function convertSaleForComponents(sale) {
  return {
    items: (sale.items || []).map(item => ({
      id: item.id || '',
      itemId: item.item_id || item.itemId || '',
      itemCode: item.item_id || item.itemId || '',
      itemName: item.item_name || item.itemName || '',
      quantity: item.quantity || 0,
      price: item.unit_price || item.price || 0,
      tax: item.tax_rate || 0,
      discount: item.discount_amount || item.discount || 0,
      total: item.total_amount || item.total || 0,
    }))
  };
}

const converted = convertSaleForComponents(testData);
console.log('Converted items:', JSON.stringify(converted.items, null, 2));
console.log('First item name:', converted.items[0].itemName);
