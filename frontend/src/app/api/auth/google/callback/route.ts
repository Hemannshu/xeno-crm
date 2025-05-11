import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const error = searchParams.get('error');

    console.log('Google callback received:', { code: !!code, error });

    if (error) {
      console.error('Google OAuth error:', error);
      return NextResponse.redirect(new URL('/auth/login?error=auth_failed', process.env.NEXT_PUBLIC_APP_URL));
    }

    if (!code) {
      console.error('No code received from Google');
      return NextResponse.redirect(new URL('/auth/login?error=no_code', process.env.NEXT_PUBLIC_APP_URL));
    }

    // Log environment variables (without sensitive data)
    console.log('Environment check:', {
      hasClientId: !!process.env.GOOGLE_CLIENT_ID,
      hasClientSecret: !!process.env.GOOGLE_CLIENT_SECRET,
      appUrl: process.env.NEXT_PUBLIC_APP_URL,
      apiUrl: process.env.NEXT_PUBLIC_API_URL,
    });

    // Exchange the code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/google/callback`,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Token exchange failed:', errorData);
      throw new Error(`Token exchange failed: ${errorData.error_description || errorData.error}`);
    }

    const tokens = await tokenResponse.json();
    console.log('Successfully received tokens from Google');

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokens.access_token}`,
      },
    });

    if (!userResponse.ok) {
      const errorData = await userResponse.json();
      console.error('User info fetch failed:', errorData);
      throw new Error(`User info fetch failed: ${errorData.error_description || errorData.error}`);
    }

    const userData = await userResponse.json();
    console.log('Successfully received user data from Google:', { email: userData.email });

    // Send the user data to your backend
    const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        googleId: userData.id,
        email: userData.email,
        name: userData.name,
        picture: userData.picture,
      }),
    });

    if (!backendResponse.ok) {
      const errorData = await backendResponse.json();
      console.error('Backend authentication failed:', {
        status: backendResponse.status,
        statusText: backendResponse.statusText,
        error: errorData
      });
      throw new Error(`Backend authentication failed: ${errorData.message || errorData.error || 'Unknown error'}`);
    }

    const { token, user } = await backendResponse.json();
    console.log('Successfully received token and user data from backend:', {
      userId: user.id,
      email: user.email,
      name: user.name
    });

    // Create response with cookie
    const response = NextResponse.redirect(new URL('/auth/callback', process.env.NEXT_PUBLIC_APP_URL));
    
    // Set the auth token cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Google OAuth callback error:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    
    const errorMessage = encodeURIComponent(
      error instanceof Error ? error.message : 'Authentication failed'
    );
    return NextResponse.redirect(
      new URL(`/auth/login?error=auth_failed&message=${errorMessage}`, process.env.NEXT_PUBLIC_APP_URL)
    );
  }
} 