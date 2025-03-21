import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    console.log('Starting upload process...');
    
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.log('No file received in request');
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Log file details
    console.log('File details:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Create unique filename
    const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const storageRef = ref(storage, `media/${filename}`);

    try {
      // Upload to Firebase Storage
      console.log('Attempting Firebase upload...');
      const result = await uploadBytes(storageRef, buffer, {
        contentType: file.type,
      });
      
      console.log('Upload successful, getting download URL...');
      const downloadURL = await getDownloadURL(result.ref);
      
      console.log('Process completed successfully');
      return NextResponse.json({
        success: true,
        url: downloadURL
      });
      
    } catch (firebaseError) {
      console.error('Firebase Storage Error:', firebaseError);
      return NextResponse.json({
        error: 'Firebase Storage Error',
        details: firebaseError instanceof Error ? firebaseError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Upload Route Error:', error);
    return NextResponse.json({
      error: 'Upload failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}