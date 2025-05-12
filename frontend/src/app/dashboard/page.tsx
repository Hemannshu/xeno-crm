'use client';

import { useRealtimeUpdates } from '../hooks/useRealtimeUpdates';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, error, connected } = useRealtimeUpdates();
  const [campaignData, setCampaignData] = useState([]);

  useEffect(() => {
    // Aggregate SENT/FAILED from all campaigns in localStorage
    const campaigns = JSON.parse(localStorage.getItem("mockCampaigns") || "[]");
    let sent = 0, failed = 0;
    campaigns.forEach(c => {
      (c.logs || []).forEach(log => {
        if (log.status === "SENT") sent++;
        if (log.status === "FAILED") failed++;
      });
    });
    setCampaignData([
      { name: "Sent", value: sent },
      { name: "Failed", value: failed }
    ]);
  }, []);

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

      <Card className="max-w-xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Campaign Delivery Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={campaignData}>
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#6366f1" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

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