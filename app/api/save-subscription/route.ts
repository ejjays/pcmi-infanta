import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import clientPromise from '@/lib/mongodb';

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { subscription } = await req.json();
    
    if (!subscription || !subscription.endpoint) {
      return NextResponse.json(
        { error: 'Invalid subscription' },
        { status: 400 }
      );
    }
    
    const client = await clientPromise;
    const db = client.db('christsonalloso021');
    
    // Check if subscription already exists
    const existingSubscription = await db.collection('push-subscriptions').findOne({
      'subscription.endpoint': subscription.endpoint
    });
    
    if (existingSubscription) {
      // Update the existing subscription with the latest data
      await db.collection('push-subscriptions').updateOne(
        { 'subscription.endpoint': subscription.endpoint },
        { $set: { subscription, userId, updatedAt: new Date() } }
      );
    } else {
      // Insert new subscription
      await db.collection('push-subscriptions').insertOne({
        subscription,
        userId,
        createdAt: new Date()
      });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving subscription:', error);
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}