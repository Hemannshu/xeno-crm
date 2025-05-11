'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Loader2 } from 'lucide-react';

interface CampaignStats {
  totalReached: number;
  delivered: number;
  failed: number;
  openRate?: number;
  clickRate?: number;
  customerSegments?: { [key: string]: number };
}

interface CampaignSummary {
  summary: string;
  insights: string[];
}

export function AICampaignSummary() {
  const [stats, setStats] = useState<CampaignStats>({
    totalReached: 0,
    delivered: 0,
    failed: 0,
  });
  const [summary, setSummary] = useState<CampaignSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateSummary = async () => {
    if (!stats.totalReached || !stats.delivered || !stats.failed) {
      setError('Please fill in all required statistics');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/ai/campaign-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(stats),
      });

      if (!response.ok) {
        throw new Error('Failed to generate summary');
      }

      const data = await response.json();
      setSummary(data);
    } catch (err) {
      setError('Failed to generate summary. Please try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatChange = (field: keyof CampaignStats, value: string) => {
    const numValue = parseFloat(value) || 0;
    setStats((prev) => ({ ...prev, [field]: numValue }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>AI Campaign Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Total Reached
              </label>
              <input
                type="number"
                value={stats.totalReached || ''}
                onChange={(e) => handleStatChange('totalReached', e.target.value)}
                className="w-full p-2 border rounded"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Delivered
              </label>
              <input
                type="number"
                value={stats.delivered || ''}
                onChange={(e) => handleStatChange('delivered', e.target.value)}
                className="w-full p-2 border rounded"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Failed
              </label>
              <input
                type="number"
                value={stats.failed || ''}
                onChange={(e) => handleStatChange('failed', e.target.value)}
                className="w-full p-2 border rounded"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Open Rate (%)
              </label>
              <input
                type="number"
                value={stats.openRate || ''}
                onChange={(e) => handleStatChange('openRate', e.target.value)}
                className="w-full p-2 border rounded"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          </div>

          <Button
            onClick={generateSummary}
            disabled={loading}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Summary'
            )}
          </Button>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {summary && (
            <div className="space-y-4 mt-4">
              <Card className="bg-muted">
                <CardContent className="pt-4">
                  <h3 className="font-medium mb-2">Summary:</h3>
                  <p>{summary.summary}</p>
                </CardContent>
              </Card>

              {summary.insights.length > 0 && (
                <Card className="bg-muted">
                  <CardContent className="pt-4">
                    <h3 className="font-medium mb-2">Key Insights:</h3>
                    <ul className="list-disc list-inside space-y-1">
                      {summary.insights.map((insight, index) => (
                        <li key={index}>{insight}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 