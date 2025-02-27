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
    
    console.log(`Found ${subscriptions.length} subscriptions to notify`);
    
    if (subscriptions.length === 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'No subscriptions found',
        sentCount: 0
      });
    }
    
    // Send notifications to all subscriptions
    const results = await Promise.all(
      subscriptions.map(async ({ subscription }) => {
        try {
          console.log('Sending notification to:', subscription.endpoint.substring(0, 30) + '...');
          await webpush.sendNotification(subscription, payload);
          return { success: true, endpoint: subscription.endpoint };
        } catch (error) {
          console.error('Error sending notification:', error);
          
          // If subscription is invalid, remove it
          if (error.statusCode === 410) {
            await db.collection('push-subscriptions').deleteOne({ 'subscription.endpoint': subscription.endpoint });
            return { success: false, endpoint: subscription.endpoint, error: 'Subscription expired' };
          }
          return { success: false, endpoint: subscription.endpoint, error: error.message };
        }
      })
    );
    
    const successCount = results.filter(r => r.success).length;
    
    return NextResponse.json({ 
      success: true, 
      message: `Sent ${successCount} of ${subscriptions.length} notifications`,
      sentCount: successCount,
      results
    });
  } catch (error) {
    console.error('Error sending notifications:', error);
    return NextResponse.json(
      { error: 'Failed to send notifications', details: error.message },
      { status: 500 }
    );
  }
}