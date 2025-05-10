import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ authenticated: false, message: 'No token found' }, { status: 401 });
    }

    // Verify the token with your backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/session`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      return NextResponse.json({ authenticated: false, message: 'Invalid token' }, { status: 401 });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Session check failed:', error);
    return NextResponse.json({ authenticated: false, message: 'Internal server error' }, { status: 500 });
  }
} 