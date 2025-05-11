import { useState, useEffect } from 'react';

interface RealtimeData {
  customers: number;
  orders: number;
  revenue: number;
}

export function useRealtimeUpdates() {
  const [data, setData] = useState<RealtimeData | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const eventSource = new EventSource('/api/events');

    eventSource.onmessage = (event) => {
      try {
        const parsed = JSON.parse(event.data);
        if (parsed.type === 'connected') {
          setConnected(true);
        } else if (parsed.type === 'update') {
          setData(parsed.data);
        }
      } catch (err) {
        setError(err as Error);
      }
    };

    eventSource.onerror = () => {
      setConnected(false);
      setError(new Error('Connection lost'));
    };

    return () => {
      eventSource.close();
      setConnected(false);
    };
  }, []);

  return { data, error, connected };
} 