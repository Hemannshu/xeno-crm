import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    // Refresh the token with your backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/refresh`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const data = await response.json();

    // Set the new token in cookies
    const responseWithCookie = NextResponse.json(data);
    responseWithCookie.cookies.set('auth_token', data.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
    });

    return responseWithCookie;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return NextResponse.json({ user: null }, { status: 500 });
  }
} 