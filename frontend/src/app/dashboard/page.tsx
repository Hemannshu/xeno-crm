'use client';

import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '../context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, error, connected } = useRealtimeUpdates();

  if (!user) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="text-sm text-gray-500">
          {connected ? 'Connected' : 'Disconnected'}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 text-red-500 p-4 rounded-md">
          {error.message}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {data?.customers ?? '-'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {data?.orders ?? '-'}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              ${data?.revenue.toLocaleString() ?? '-'}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 