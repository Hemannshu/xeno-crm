import { NextResponse } from 'next/server';

// Mock data - in real app, this would be in a database
let customers = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    country: 'USA',
    postalCode: '10001',
    createdAt: '2024-03-15T10:00:00Z',
    updatedAt: '2024-03-15T10:00:00Z',
  },
];

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const customer = customers.find((c) => c.id === params.id);
  
  if (!customer) {
    return NextResponse.json(
      { error: 'Customer not found' },
      { status: 404 }
    );
  }

  return NextResponse.json(customer);
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const data = await request.json();
    const index = customers.findIndex((c) => c.id === params.id);

    if (index === -1) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    const updatedCustomer = {
      ...customers[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };

    customers[index] = updatedCustomer;
    return NextResponse.json(updatedCustomer);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update customer' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const index = customers.findIndex((c) => c.id === params.id);

  if (index === -1) {
    return NextResponse.json(
      { error: 'Customer not found' },
      { status: 404 }
    );
  }

  customers.splice(index, 1);
  return NextResponse.json({ success: true });
} 