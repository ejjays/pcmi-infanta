import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import webpush from 'web-push';
import clientPromise from '@/lib/mongodb';

// Configure web-push with your VAPID keys
webpush.setVapidDetails(
  process.env.VAPID_SUBJECT || 'mailto:christsonalloso021@gmail.com',
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  process.env.VAPID_PRIVATE_KEY || ''
);

// Custom error interface for better error handling
interface WebPushError extends Error {
  statusCode?: number;
}

export async function POST(req: NextRequest) {
  try {
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { meetingId, meetingTitle, message, url } = await req.json();
    
    if (!meetingId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Prepare notification payload
    const payload = JSON.stringify({
      title: meetingTitle || 'CG - Kamustahan',
      body: message,
      url: url || `/meeting/${meetingId}`
    });
    
    // Get all subscriptions from database
    const client = await clientPromise;
    const db = client.db('christsonalloso021');
    const subscriptions = await db.collection('push-subscriptions').find({}).toArray();
    
    // Send notifications to all subscriptions
    const notificationPromises = subscriptions.map(async ({ subscription }) => {
      try {
        await webpush.sendNotification(subscription, payload);
        return true;
      } catch (error) {
        console.error('Error sending notification:', error);
        // Type assertion for better error handling
        const webPushError = error as WebPushError;
        // If subscription is invalid, remove it
        if (webPushError.statusCode === 410) {
          await db.collection('push-subscriptions').deleteOne({ 'subscription.endpoint': subscription.endpoint });
        }
        return false;
      }
    });
    
    await Promise.all(notificationPromises);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending notifications:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications' },
      { status: 500 }
    );
  }
}