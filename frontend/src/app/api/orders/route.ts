import { NextResponse } from 'next/server';

// Mock data for demonstration
let orders = [
  {
    id: '1',
    customerName: 'John Doe',
    date: '2024-03-15',
    status: 'Completed',
    total: 299.99,
  },
  {
    id: '2',
    customerName: 'Jane Smith',
    date: '2024-03-14',
    status: 'Processing',
    total: 149.99,
  },
  // Add more mock orders as needed
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const page = parseInt(searchParams.get('page') || '1');
  const limit = parseInt(searchParams.get('limit') || '10');
  const query = searchParams.get('query') || '';

  // Filter orders based on search query
  const filteredOrders = orders.filter(
    (order) =>
      order.customerName.toLowerCase().includes(query.toLowerCase()) ||
      order.id.toLowerCase().includes(query.toLowerCase())
  );

  // Calculate pagination
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex);

  return NextResponse.json({
    orders: paginatedOrders,
    pagination: {
      total: filteredOrders.length,
      totalPages: Math.ceil(filteredOrders.length / limit),
      currentPage: page,
      limit,
    },
  });
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Create new order
    const newOrder = {
      id: Math.random().toString(36).substr(2, 9), // Generate random ID
      ...data,
    };
    
    orders.push(newOrder);
    
    return NextResponse.json(newOrder, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
} 