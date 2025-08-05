const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://txpufkxjnxhpnmydwdng.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4cHVma3hqbnhocG5teWR3ZG5nIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MjQ5MjQzOSwiZXhwIjoyMDY4MDY4NDM5fQ.mc9o0WbV_STZSmU8TdwBOT6L5ZpmvQepUNTSKF3b5is'
);

async function createSampleData() {
  console.log('🎯 Creating sample business data for testing...');
  
  try {
    // Create sample items
    const sampleItems = [
      {
        name: 'Premium Coffee Beans',
        sku: 'PCB-001',
        sale_price: 25.99,
        purchase_price: 18.50,
        stock: 200,
        min_stock: 20,
        description: 'High-quality arabica coffee beans',
        tax_rate: 5,
        status: 'active',
        type: 'product'
      },
      {
        name: 'Wireless Headphones',
        sku: 'WH-002',
        sale_price: 89.99,
        purchase_price: 65.00,
        stock: 50,
        min_stock: 10,
        description: 'Bluetooth wireless headphones with noise cancellation',
        tax_rate: 18,
        status: 'active',
        type: 'product'
      },
      {
        name: 'Organic Tea Leaves',
        sku: 'OTL-003',
        sale_price: 15.99,
        purchase_price: 12.00,
        stock: 150,
        min_stock: 25,
        description: 'Premium organic green tea leaves',
        tax_rate: 5,
        status: 'active',
        type: 'product'
      }
    ];

    console.log('📦 Creating sample items...');
    for (const item of sampleItems) {
      const { data, error } = await supabase
        .from('items')
        .insert(item)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Failed to create item:', item.name, error.message);
      } else {
        console.log('✅ Created item:', data.name);
      }
    }

    // Create sample customers
    const sampleCustomers = [
      {
        name: 'John Doe Electronics',
        type: 'customer',
        phone: '+1-555-0101',
        email: 'john@electronics.com',
        address: '123 Main Street, New York, NY 10001',
        balance: 0,
        status: 'active'
      },
      {
        name: 'Sarah Wilson Café',
        type: 'customer',
        phone: '+1-555-0202',
        email: 'sarah@wilsoncafe.com',
        address: '456 Coffee Ave, Seattle, WA 98101',
        balance: 0,
        status: 'active'
      },
      {
        name: 'Metro Office Supplies',
        type: 'customer',
        phone: '+1-555-0303',
        email: 'orders@metrooffice.com',
        address: '789 Business Blvd, Chicago, IL 60601',
        balance: 0,
        status: 'active'
      }
    ];

    console.log('👥 Creating sample customers...');
    for (const customer of sampleCustomers) {
      const { data, error } = await supabase
        .from('parties')
        .insert(customer)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Failed to create customer:', customer.name, error.message);
      } else {
        console.log('✅ Created customer:', data.name);
      }
    }

    // Create sample suppliers
    const sampleSuppliers = [
      {
        name: 'Global Coffee Imports',
        type: 'supplier',
        phone: '+1-555-1001',
        email: 'supplier@globalcoffee.com',
        address: '321 Import Lane, Miami, FL 33101',
        balance: 0,
        status: 'active'
      },
      {
        name: 'Tech Components Ltd',
        type: 'supplier',
        phone: '+1-555-1002',
        email: 'sales@techcomponents.com',
        address: '654 Industry Road, Austin, TX 73301',
        balance: 0,
        status: 'active'
      }
    ];

    console.log('🏭 Creating sample suppliers...');
    for (const supplier of sampleSuppliers) {
      const { data, error } = await supabase
        .from('parties')
        .insert(supplier)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Failed to create supplier:', supplier.name, error.message);
      } else {
        console.log('✅ Created supplier:', data.name);
      }
    }

    // Insert default settings
    console.log('⚙️ Setting up default business settings...');
    const generalSettings = {
      category: 'general',
      settings_data: {
        businessName: 'Combined CRM Demo Business',
        businessAddress: '123 Business Street, Demo City, DC 12345',
        businessPhone: '+1-555-DEMO-BIZ',
        businessEmail: 'info@combinedcrm.demo',
        businessCurrency: 'USD',
        businessCountry: 'US',
        businessLogo: '',
        businessGST: 'GST123456789',
        businessPAN: 'ABCDE1234F'
      }
    };

    const { data: settingsData, error: settingsError } = await supabase
      .from('settings')
      .upsert(generalSettings, { onConflict: 'category' })
      .select()
      .single();

    if (settingsError) {
      console.error('❌ Failed to create settings:', settingsError.message);
    } else {
      console.log('✅ Created business settings');
    }

    console.log('\n🎉 Sample data created successfully!');
    console.log('📊 Summary:');
    
    // Get counts
    const { data: itemCount } = await supabase
      .from('items')
      .select('id', { count: 'exact' });
    
    const { data: customerCount } = await supabase
      .from('parties')
      .select('id', { count: 'exact' })
      .eq('type', 'customer');
    
    const { data: supplierCount } = await supabase
      .from('parties')
      .select('id', { count: 'exact' })
      .eq('type', 'supplier');

    console.log(`   📦 Items: ${itemCount?.length || 0}`);
    console.log(`   👥 Customers: ${customerCount?.length || 0}`);
    console.log(`   🏭 Suppliers: ${supplierCount?.length || 0}`);
    console.log('\n✨ Your Combined CRM is now ready with sample data!');
    console.log('🚀 Open the Electron app and start testing all features.');

  } catch (error) {
    console.error('💥 Error creating sample data:', error);
  }
}

createSampleData();
