import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs';
import clientPromise from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const { userId } = auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const subscription = await req.json();
    
    const client = await clientPromise;
    const db = client.db('christsonalloso021');
    
    // Store subscription with user ID
    await db.collection('push-subscriptions').updateOne(
      { userId },
      { $set: { userId, subscription, updatedAt: new Date() } },
      { upsert: true }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving subscription:', error);
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}