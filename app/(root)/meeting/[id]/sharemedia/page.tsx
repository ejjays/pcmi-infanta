'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { Upload, X, Image as ImageIcon, Film } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { db, auth } from '@/lib/firebase'; 
import { collection, addDoc } from 'firebase/firestore';
import { signInWithCustomToken } from 'firebase/auth';

const MediaSharingAdminPage = () => {
  const { id } = useParams();
  const { user } = useUser();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Check if user is admin
  const ALLOWED_ADMIN_IDS = ['user_2pNBsKMcT3yj2PXM3XbImRjcYVG']; // Add your admin IDs
  const isAdmin = user && ALLOWED_ADMIN_IDS.includes(user.id);

  useEffect(() => {
    const setupFirebaseAuth = async () => {
      if (user) {
        try {
          // Get a custom token from your backend
          const response = await fetch('/api/get-firebase-token', {
            headers: {
              Authorization: `Bearer ${await user.getToken()}`,
            },
          });
          const { firebaseToken } = await response.json();
          
          // Sign in to Firebase with the custom token
          await signInWithCustomToken(auth, firebaseToken);
        } catch (error) {
          console.error('Firebase auth error:', error);
        }
      }
    };

    setupFirebaseAuth();
  }, [user]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !isAdmin || !user) return; // Add user check here
  
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();

      // Save to Firestore with user information
      await addDoc(collection(db, 'media'), {
        url: data.url,
        type: selectedFile.type.startsWith('image/') ? 'image' : 'video',
        createdAt: new Date(),
        meetingId: id,
        userId: user.id, 
        createdBy: user.fullName || user.username
      });

      // Clear selection after upload
      setSelectedFile(null);
      setPreviewUrl(null);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-white text-center">
          <h1 className="text-2xl font-bold mb-2">Access Denied</h1>
          <p>You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-2 p-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-6">
          Media Sharing Admin Panel
        </h1>
        
        <div className="bg-dark-1 rounded-lg p-6 mb-6">
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-8 text-center">
            <input
              type="file"
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            
            {!previewUrl ? (
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="h-12 w-12 text-gray-400 mb-3" />
                <p className="text-gray-300 mb-2">
                  Click to upload or drag and drop
                </p>
                <p className="text-gray-500 text-sm">
                  Images or Videos up to 100MB
                </p>
              </label>
            ) : (
              <div className="relative">
                {selectedFile?.type.startsWith('image/') ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="max-h-[300px] mx-auto rounded"
                  />
                ) : (
                  <video
                    src={previewUrl}
                    controls
                    className="max-h-[300px] mx-auto rounded"
                  />
                )}
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl(null);
                  }}
                  className="absolute top-2 right-2 p-1 bg-black/50 rounded-full"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            )}
          </div>
          
          {selectedFile && (
            <div className="mt-4 flex justify-end">
              <Button
                onClick={handleUpload}
                disabled={isUploading}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isUploading ? 'Uploading...' : 'Upload Media'}
              </Button>
            </div>
          )}
        </div>

        {/* Media List Section - To be implemented */}
        <div className="bg-dark-1 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-white mb-4">
            Uploaded Media
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {/* Media items will be listed here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MediaSharingAdminPage;