import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';

export async function GET(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Since you're using Clerk for authentication, you can return a simple token
    // or just the user ID as authentication is handled by Clerk
    return NextResponse.json({
      success: true,
      firebaseToken: userId // or any other token format you need
    });

  } catch (error) {
    console.error('Error generating Firebase token:', error);
    return NextResponse.json(
      { error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}