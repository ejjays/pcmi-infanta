import { NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    
    // Get all subscriptions from the database
    const subscriptions = await db.collection('push-subscriptions')
      .find({})
      .toArray();

    console.log(`Found ${subscriptions.length} subscriptions`);

    return NextResponse.json({
      success: true,
      subscriptions: subscriptions
    });
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscriptions' },
      { status: 500 }
    );
  }
}