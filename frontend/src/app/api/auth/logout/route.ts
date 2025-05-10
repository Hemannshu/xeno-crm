import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (token) {
      // Notify the backend about logout
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/logout`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    }

    // Clear the auth token cookie
    const response = NextResponse.json({ success: true });
    response.cookies.delete('auth_token');

    return response;
  } catch (error) {
    console.error('Logout failed:', error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
} 