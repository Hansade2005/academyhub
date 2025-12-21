import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { pipilotAuth } from '@/lib/pipilot-auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Authenticate user with PiPilot DB
    const user = await pipilotAuth.login(email, password);

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    const response = NextResponse.json({
      user,
      message: 'Login successful'
    });

    // Set HTTP-only cookie
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json({
      error: error.message || 'Invalid credentials'
    }, { status: 401 });
  }
}