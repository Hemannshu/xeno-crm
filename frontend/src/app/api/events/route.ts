import { NextResponse } from 'next/server';

export async function GET() {
  const encoder = new TextEncoder();
  let intervalId: NodeJS.Timeout;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const initialData = {
        type: 'connected',
        timestamp: new Date().toISOString()
      };
      controller.enqueue(
        encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`)
      );

      // Set up interval for sending updates
      intervalId = setInterval(() => {
        try {
          const data = {
            type: 'update',
            timestamp: new Date().toISOString(),
            data: {
              customers: Math.floor(Math.random() * 100),
              orders: Math.floor(Math.random() * 50),
              revenue: Math.floor(Math.random() * 10000),
            },
          };

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        } catch (error) {
          console.error('Error sending SSE update:', error);
          clearInterval(intervalId);
          controller.close();
        }
      }, 5000);
    },
    cancel() {
      // Clean up when the client disconnects
      if (intervalId) {
        clearInterval(intervalId);
      }
    },
  });

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
} 