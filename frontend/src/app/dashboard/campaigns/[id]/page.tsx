"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";

interface Customer {
  id: string;
  name?: string;
}

interface CommunicationLog {
  id: string;
  customer?: Customer;
  customerId: string;
  status: string;
  sentAt?: string;
  error?: string;
  message?: string;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
}

export default function CampaignDetailsPage() {
  const params = useParams();
  const campaignId = params.id;
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [logs, setLogs] = useState<CommunicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const USE_MOCK = true;

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      if (USE_MOCK) {
        // Get from localStorage
        const campaigns = JSON.parse(localStorage.getItem('mockCampaigns') || '[]');
        const campaign = campaigns.find((c: any) => c.id === campaignId);
        setCampaign(campaign || null);
        // For mock, simulate logs as an array of customers with status, etc.
        setLogs(campaign?.logs || campaign?.mockLogs || []);
        setLoading(false);
      } else {
        // Real API
        const [campaignRes, logsRes] = await Promise.all([
          fetch(`/api/campaigns/${campaignId}`, { credentials: "include" }),
          fetch(`/api/campaigns/${campaignId}/logs`, { credentials: "include" })
        ]);
        const campaignData = await campaignRes.json();
        const logsData = await logsRes.json();
        setCampaign(campaignData);
        setLogs(logsData.logs || []);
        setLoading(false);
      }
    }
    if (campaignId) fetchData();
  }, [campaignId]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!campaign) return <div className="p-8 text-center text-red-500">Campaign not found.</div>;

  return (
    <Card className="max-w-4xl mx-auto mt-8">
      <CardHeader>
        <CardTitle>Campaign Details</CardTitle>
        <div className="mt-2 text-gray-600">{campaign.name}</div>
        <div className="text-sm text-gray-500">Status: {campaign.status}</div>
      </CardHeader>
      <CardContent>
        <h3 className="font-semibold mb-2">Delivery Log</h3>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Sent At</TableHead>
              <TableHead>Error</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-400">No logs found.</TableCell>
              </TableRow>
            ) : (
              logs.map(log => (
                <TableRow key={log.id}>
                  <TableCell>{log.customer?.name || log.customerId}</TableCell>
                  <TableCell>{log.message || '-'}</TableCell>
                  <TableCell>
                    <span className={log.status === 'SENT' ? 'text-green-600' : log.status === 'FAILED' ? 'text-red-600' : 'text-gray-600'}>
                      {log.status}
                    </span>
                  </TableCell>
                  <TableCell>{log.sentAt ? new Date(log.sentAt).toLocaleString() : '-'}</TableCell>
                  <TableCell>{log.error || '-'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
} 