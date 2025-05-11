'use client';

import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';

interface MessageSuggestion {
  message: string;
  tone: string;
  imageUrl?: string;
}

export function AIMessageSuggestions() {
  const [campaignObjective, setCampaignObjective] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [suggestions, setSuggestions] = useState<MessageSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateSuggestions = async () => {
    if (!campaignObjective || !targetAudience) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');
    setSuggestions([]); // Clear previous suggestions

    try {
      const requestBody = {
        campaignObjective,
        targetAudience,
      };
      console.log('[Frontend] Sending request:', requestBody);

      const response = await fetch('http://localhost:3001/api/ai/message-suggestions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      });

      console.log('[Frontend] Response status:', response.status);
      const data = await response.json();
      console.log('[Frontend] Response data:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate suggestions');
      }

      if (!data.suggestions || !Array.isArray(data.suggestions)) {
        console.error('[Frontend] Invalid response format:', data);
        throw new Error('Invalid response format from server');
      }

      // Validate each suggestion has the required fields
      const validSuggestions = data.suggestions.filter((suggestion: any) => {
        const isValid = suggestion.message && suggestion.tone;
        if (!isValid) {
          console.warn('[Frontend] Invalid suggestion format:', suggestion);
        }
        return isValid;
      });

      if (validSuggestions.length === 0) {
        throw new Error('No valid suggestions received from server');
      }

      console.log('[Frontend] Setting suggestions:', validSuggestions);
      setSuggestions(validSuggestions);
    } catch (err: any) {
      console.error('[Frontend] Error in generateSuggestions:', err);
      setError(err.message || 'Failed to generate suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>AI Message Suggestions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="campaignObjective">Campaign Objective</Label>
            <Textarea
              id="campaignObjective"
              placeholder="e.g., Bring back inactive users"
              value={campaignObjective}
              onChange={(e) => setCampaignObjective(e.target.value)}
              className="w-full"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="targetAudience">Target Audience</Label>
            <Textarea
              id="targetAudience"
              placeholder="e.g., Users who haven't logged in for 30 days"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              className="w-full"
            />
          </div>
          <Button
            onClick={generateSuggestions}
            disabled={loading || !campaignObjective || !targetAudience}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Suggestions'
            )}
          </Button>

          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {suggestions.length > 0 && (
            <div className="mt-6 space-y-6">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="space-y-4 p-4 border rounded-lg">
                  <div className="flex items-start gap-4">
                    {suggestion.imageUrl && (
                      <div className="w-48 h-32 relative rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={suggestion.imageUrl}
                          alt={`Suggested image for ${suggestion.tone} tone`}
                          className="object-cover w-full h-full"
                        />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <p className="text-lg font-medium capitalize">{suggestion.tone}</p>
                      <p className="text-sm text-muted-foreground">
                        {suggestion.message}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 