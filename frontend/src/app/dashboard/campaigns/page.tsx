'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Pagination } from '@/components/ui/pagination';

interface Campaign {
  id: string;
  name: string;
  type: string;
  status: 'draft' | 'active' | 'paused' | 'completed';
  startDate: string;
  endDate: string;
  budget: number;
  spent: number;
  impressions: number;
  clicks: number;
  conversions: number;
}

export default function CampaignsPage() {
  const router = useRouter();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  // Use localStorage for mock campaigns
  useEffect(() => {
    setLoading(true);
    const stored = localStorage.getItem('mockCampaigns');
    let data: Campaign[] = [];
    if (stored) {
      data = JSON.parse(stored);
    }
    // Optionally filter by searchQuery
    if (searchQuery) {
      data = data.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    setCampaigns(data);
    setTotalPages(1); // No pagination for mock
    setLoading(false);
  }, [searchQuery]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
  };

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campaigns</CardTitle>
        <div className="flex items-center justify-between">
          <Input
            placeholder="Search campaigns..."
            value={searchQuery}
            onChange={handleSearch}
            className="max-w-sm"
          />
          <Button onClick={() => router.push('/dashboard/campaigns/new')}>
            Create Campaign
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Budget</TableHead>
              <TableHead>Spent</TableHead>
              <TableHead>Performance</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.isArray(campaigns) && campaigns.length > 0 ? (
              campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>{campaign.name}</TableCell>
                  <TableCell>{campaign.type}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(campaign.status)}`}>
                      {campaign.status}
                    </span>
                  </TableCell>
                  <TableCell>${typeof campaign.budget === 'number' ? campaign.budget.toFixed(2) : '0.00'}</TableCell>
                  <TableCell>${typeof campaign.spent === 'number' ? campaign.spent.toFixed(2) : '0.00'}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>Impressions: {(typeof campaign.impressions === 'number' ? campaign.impressions : 0).toLocaleString()}</div>
                      <div>Clicks: {(typeof campaign.clicks === 'number' ? campaign.clicks : 0).toLocaleString()}</div>
                      <div>Conversions: {(typeof campaign.conversions === 'number' ? campaign.conversions : 0).toLocaleString()}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      onClick={() => router.push(`/dashboard/campaigns/${campaign.id}`)}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500">
                  {loading ? 'Loading campaigns...' : 'No campaigns found.'}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <div className="mt-4 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </CardContent>
    </Card>
  );
} 