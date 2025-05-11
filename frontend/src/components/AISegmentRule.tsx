'use client';

import * as React from 'react';
import { useState } from 'react';
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "./ui/card";
import { Textarea } from "./ui/textarea";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export function AISegmentRule() {
  const [prompt, setPrompt] = useState('');
  const [rules, setRules] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateRules = async () => {
    setLoading(true);
    setError('');
    setRules(null);
    try {
      const res = await fetch('http://localhost:3001/api/ai/segment-rule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to generate rules');
      setRules(data.rules);
    } catch (err: any) {
      setError(err.message || 'Error generating rules');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Natural Language to Segment Rules</CardTitle>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="e.g., People who haven't shopped in 6 months and spent over ₹5K"
          value={prompt}
          onChange={e => setPrompt(e.target.value)}
          className="mb-4"
        />
        <Button onClick={generateRules} disabled={loading || !prompt} className="w-full">
          {loading ? 'Generating...' : 'Generate Rules'}
        </Button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
        {rules && (
          <pre className="mt-4 bg-gray-100 p-2 rounded text-sm overflow-x-auto">
            {JSON.stringify(rules, null, 2)}
          </pre>
        )}
      </CardContent>
    </Card>
  );
} 