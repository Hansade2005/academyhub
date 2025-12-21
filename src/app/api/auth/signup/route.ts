import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { pipilotAuth } from '@/lib/pipilot-auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export async function POST(request: NextRequest) {
  try {
    const { email, password, full_name } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    // Register user with PiPilot DB
    const user = await pipilotAuth.register(email, password, full_name);

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });

    const response = NextResponse.json({
      user,
      message: 'Account created successfully'
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
    console.error('Signup error:', error);
    const status = error.message.includes('already exists') ? 409 : 400;
    return NextResponse.json({
      error: error.message || 'Failed to create account'
    }, { status });
  }
}