import { NextResponse } from 'next/server';

// Mock data for demonstration
let customers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    city: 'New York',
    country: 'USA',
  },
  // Add more mock customers as needed
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const query = searchParams.get('query') || '';

  // Filter customers based on search query
  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(query.toLowerCase()) ||
      customer.email.toLowerCase().includes(query.toLowerCase())
  );

  // Calculate pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  return NextResponse.json({
    customers: paginatedCustomers,
    pagination: {
      total: filteredCustomers.length,
      totalPages: Math.ceil(filteredCustomers.length / limit),
      currentPage: page,
      limit,
    },
  });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Create new customer
    const newCustomer = {
      id: Math.random().toString(36).substr(2, 9), // Generate random ID
      ...data,
    };
    
    customers.push(newCustomer);
    
    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    );
  }
} 