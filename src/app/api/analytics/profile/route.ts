import { NextRequest, NextResponse } from 'next/server';
import { createUserAnalyticsProfile, getUserAnalyticsProfile, updateUserAnalyticsProfile } from '@/lib/database-tools';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, analyticsData } = body;

    if (!userId || !analyticsData) {
      return NextResponse.json(
        { error: 'User ID and analytics data are required' },
        { status: 400 }
      );
    }

    try {
      await updateUserAnalyticsProfile(userId, analyticsData);

      return NextResponse.json({
        success: true,
        message: 'Analytics profile stored successfully'
      });
    } catch (error) {
      console.error('Error updating analytics profile:', error);
      return NextResponse.json(
        { error: 'Failed to store analytics profile' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Analytics profile API error:', error);
    return NextResponse.json(
      { error: 'Failed to store analytics profile' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    try {
      const response = await getUserAnalyticsProfile(userId);

      if (!response.data || response.data.length === 0) {
        return NextResponse.json(
          { error: 'Analytics profile not found' },
          { status: 404 }
        );
      }

      const profile = response.data[0] as any;

      // Parse JSON fields
      const analyticsData = {
        demographics: JSON.parse(profile.demographics || '{}'),
        professionalBackground: JSON.parse(profile.professional_background || '{}'),
        careerGoals: JSON.parse(profile.career_goals || '{}'),
        learningPreferences: JSON.parse(profile.learning_preferences || '{}'),
        discoverySource: profile.discovery_source,
        marketingConsent: profile.marketing_consent
      };

      return NextResponse.json({
        success: true,
        data: analyticsData
      });
    } catch (error) {
      console.error('Error retrieving analytics profile:', error);
      return NextResponse.json(
        { error: 'Failed to retrieve analytics profile' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Analytics profile GET error:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve analytics profile' },
      { status: 500 }
    );
  }
}