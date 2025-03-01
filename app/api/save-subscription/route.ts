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
    
    console.log('Saving subscription:', subscription.endpoint); // Added logging

    const client = await clientPromise;
    const db = client.db('christsonalloso021');
    
    // Check if subscription already exists
    const existingSubscription = await db.collection('push-subscriptions').findOne({
      'subscription.endpoint': subscription.endpoint
    });
    
    if (existingSubscription) {
      await db.collection('push-subscriptions').updateOne(
        { 'subscription.endpoint': subscription.endpoint },
        { $set: { subscription, userId, updatedAt: new Date() } }
      );
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      await db.collection('push-subscriptions').insertOne({
        subscription,
        userId,
        createdAt: new Date()
      });
      return NextResponse.json({ success: true }, { status: 201 }); // Created
    }
  } catch (error) {
    console.error('Error saving subscription:', error);
    return NextResponse.json(
      { error: 'Failed to save subscription' },
      { status: 500 }
    );
  }
}