'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/context/AuthContext';
import { CustomerForm } from '@/app/components/customers/CustomerForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  createdAt: string;
  updatedAt: string;
}

export default function CustomerDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const router = useRouter();
  const { user } = useAuth();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    fetchCustomer();
  }, [params.id]);

  const fetchCustomer = async () => {
    try {
      const response = await fetch(`/api/customers/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch customer');
      const data = await response.json();
      setCustomer(data);
    } catch (error) {
      toast.error('Failed to load customer details');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this customer?')) return;

    try {
      const response = await fetch(`/api/customers/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete customer');

      toast.success('Customer deleted successfully');
      router.push('/dashboard/customers');
    } catch (error) {
      toast.error('Failed to delete customer');
    }
  };

  if (!user) return null;
  if (loading) return <div>Loading...</div>;
  if (!customer) return <div>Customer not found</div>;

  if (isEditing) {
    return (
      <div className="max-w-2xl mx-auto">
        <CustomerForm
          initialData={customer}
          customerId={customer.id}
          onSuccess={() => {
            setIsEditing(false);
            fetchCustomer();
          }}
        />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Customer Details</CardTitle>
        <div className="space-x-2">
          <Button onClick={() => setIsEditing(true)}>Edit</Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <dl className="grid grid-cols-2 gap-4">
          <div>
            <dt className="text-sm font-medium text-gray-500">Name</dt>
            <dd className="mt-1">{customer.name}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Email</dt>
            <dd className="mt-1">{customer.email}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Phone</dt>
            <dd className="mt-1">{customer.phone || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Address</dt>
            <dd className="mt-1">{customer.address || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">City</dt>
            <dd className="mt-1">{customer.city || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">State</dt>
            <dd className="mt-1">{customer.state || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Country</dt>
            <dd className="mt-1">{customer.country || '-'}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Postal Code</dt>
            <dd className="mt-1">{customer.postalCode || '-'}</dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
} 