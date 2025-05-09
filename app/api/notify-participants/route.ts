import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import webpush from 'web-push';
import clientPromise from '@/lib/mongodb';

const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;
const vapidSubject = process.env.VAPID_SUBJECT;

console.log('VAPID Configuration:', {
  publicKeyExists: !!vapidPublicKey,
  privateKeyExists: !!vapidPrivateKey,
  subjectExists: !!vapidSubject
});

webpush.setVapidDetails(
  vapidSubject!,
  vapidPublicKey!,
  vapidPrivateKey!
);

// Custom error interface for better error handling
interface WebPushError extends Error {
  statusCode?: number;
}

// Type guard function to check for WebPushError
function isWebPushError(error: unknown): error is WebPushError {
  return (
    typeof error === 'object' && 
    error !== null && 
    'statusCode' in error
  );
}

export async function POST(req: NextRequest) {
  try {
    console.log('Notification API called');
    const { userId } = getAuth(req);
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const { meetingId, meetingTitle, message, url } = await req.json();
    console.log('Meeting details:', { meetingId, meetingTitle, message, url });
    
    if (!meetingId || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Detailed logging at the beginning of the POST function
    console.log('Notification API called with user ID:', userId);
    console.log('Request body:', { meetingId, meetingTitle, message, url });
    
const payload = JSON.stringify({
  title: meetingTitle || 'CG - Kamustahan',
  message: message,
  url: url || `/meeting/${meetingId}`,
  timestamp: new Date().toISOString(),
  type: 'meeting_notification',
  data: {
    meetingId,
    url: url || `/meeting/${meetingId}`,
    timestamp: new Date().toISOString()
  }
});

console.log('Sending notification payload:', payload);
    
    const client = await clientPromise;
    const db = client.db('christsonalloso021');
    const subscriptions = await db.collection('push-subscriptions').find({}).toArray();
    
    console.log(`Found ${subscriptions.length} subscriptions to notify`);
    
    if (subscriptions.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'No subscriptions found',
        sentCount: 0
      });
    }
    
    // Log subscription details
    console.log('Subscription details:', subscriptions.map(s => ({
      endpoint: s.subscription.endpoint.substring(0, 30) + '...',
      keys: !!s.subscription.keys
    })));
    
    console.log(`Found ${subscriptions.length} subscriptions in database`);
    
    // Send notifications to all subscriptions
    const notificationPromises = subscriptions.map(async (sub) => {
      try {
        console.log('Sending notification to:', sub.subscription.endpoint.substring(0, 30) + '...');
        await webpush.sendNotification(sub.subscription, payload);
        return { success: true, endpoint: sub.subscription.endpoint };
      } catch (error) {
        console.error('Error sending notification:', {
          endpoint: sub.subscription.endpoint,
          error: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        });
        
        // Handle expired subscriptions
        if (isWebPushError(error) && error.statusCode === 410) {
          await db.collection('push-subscriptions').deleteOne({ 'subscription.endpoint': sub.subscription.endpoint });
          return { success: false, endpoint: sub.subscription.endpoint, error: 'Subscription expired' };
        }
        return { success: false, endpoint: sub.subscription.endpoint, error: (error instanceof Error ? error.message : 'Unknown error') };
      }
    });

    const results = await Promise.all(notificationPromises);
    const successCount = results.filter(r => r.success).length;

    return NextResponse.json({
      success: true,
      message: `Sent notifications to ${successCount} of ${subscriptions.length} subscribers`,
      sentCount: successCount,
      results
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}