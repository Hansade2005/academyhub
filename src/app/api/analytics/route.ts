import { NextRequest, NextResponse } from 'next/server';
import { logAnalyticsEvent, createUserAnalyticsProfile, updateUserAnalyticsProfile, queryTable, TABLE_IDS } from '@/lib/database-tools';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, eventType, data, analyticsData } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // If this is analytics profile data (from signup), store in user_analytics_profiles table
    if (analyticsData) {
      try {
        await createUserAnalyticsProfile(userId, analyticsData);
        return NextResponse.json({
          success: true,
          message: 'Analytics profile stored successfully'
        });
      } catch (error) {
        console.error('Error creating analytics profile:', error);
        return NextResponse.json(
          { error: 'Failed to store analytics profile' },
          { status: 500 }
        );
      }
    }

    // If this is a general analytics event, store in analytics table
    if (eventType && data) {
      try {
        await logAnalyticsEvent(userId, eventType, {
          ...data,
          timestamp: new Date().toISOString(),
          session_id: data.sessionId || null,
          user_agent: request.headers.get('user-agent') || null,
          ip_address: request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown'
        });

        return NextResponse.json({
          success: true,
          message: 'Analytics event stored successfully'
        });
      } catch (error) {
        console.error('Error logging analytics event:', error);
        return NextResponse.json(
          { error: 'Failed to store analytics event' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Invalid request: either analyticsData or eventType/data required' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to store analytics data' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const eventType = searchParams.get('eventType');
    const limit = parseInt(searchParams.get('limit') || '50');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    const queryOptions: any = {
      where: { user_id: userId },
      orderBy: { field: 'timestamp', direction: 'DESC' },
      limit: limit
    };

    if (eventType) {
      queryOptions.where.event_type = eventType;
    }

    const response = await queryTable(TABLE_IDS.analytics, queryOptions);

    return NextResponse.json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error('Analytics GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve analytics data' },
      { status: 500 }
    );
  }
}