import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    // Add detailed logging
    console.log('Starting file upload process...');
    
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.log('No file provided in request');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const storageRef = ref(storage, `media/${Date.now()}_${file.name}`);
    
    const metadata = {
      contentType: file.type,
      customMetadata: {
        'Access-Control-Allow-Origin': '*'
      }
    };

    console.log('Attempting to upload to Firebase Storage...');
    
    try {
      const snapshot = await uploadBytes(storageRef, buffer, metadata);
      console.log('Upload successful, getting download URL...');
      
      const downloadURL = await getDownloadURL(snapshot.ref);
      console.log('Download URL obtained:', downloadURL);

      return NextResponse.json({ 
        success: true, 
        url: downloadURL 
      });
    } catch (firebaseError) {
      console.error('Firebase upload error:', firebaseError);
      return NextResponse.json({ 
        error: 'Firebase upload failed',
        details: firebaseError instanceof Error ? firebaseError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Upload route error:', error);
    return NextResponse.json({ 
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}