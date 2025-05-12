'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [smsNotifications, setSmsNotifications] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('settings');
    if (saved) {
      const { name, email, emailNotifications, smsNotifications } = JSON.parse(saved);
      setName(name || '');
      setEmail(email || '');
      setEmailNotifications(!!emailNotifications);
      setSmsNotifications(!!smsNotifications);
    }
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Save to localStorage for demo
      localStorage.setItem('settings', JSON.stringify({
        name, email, emailNotifications, smsNotifications
      }));
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input id="name" placeholder="Your name" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="email-notifications" className="rounded" checked={emailNotifications} onChange={e => setEmailNotifications(e.target.checked)} />
              <Label htmlFor="email-notifications">Email Notifications</Label>
            </div>
            <div className="flex items-center space-x-2">
              <input type="checkbox" id="sms-notifications" className="rounded" checked={smsNotifications} onChange={e => setSmsNotifications(e.target.checked)} />
              <Label htmlFor="sms-notifications">SMS Notifications</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 