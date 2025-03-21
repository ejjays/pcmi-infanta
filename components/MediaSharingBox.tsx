// components/MediaSharingBox.tsx
'use client';
import { useState, useEffect } from 'react';

interface MediaItem {
  id: string;
  url: string;
  type: 'image' | 'video';
  createdAt: Date;
}

const MediaSharingBox = () => {
  const [currentMedia, setCurrentMedia] = useState<MediaItem | null>(null);

  useEffect(() => {
    // Subscribe to media updates
    const q = query(
      collection(db, 'media'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const media = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      })) as MediaItem[];

      if (media.length > 0) {
        setCurrentMedia(media[0]);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div className="w-full mb-2 mt-4">
      <div className="aspect-video bg-dark-1 rounded-lg overflow-hidden relative">
        {currentMedia ? (
          currentMedia.type === 'image' ? (
            <img
              src={currentMedia.url}
              alt="Shared Media"
              className="w-full h-full object-contain"
            />
          ) : (
            <video
              src={currentMedia.url}
              controls
              className="w-full h-full"
            />
          )
        ) : (
          <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm text-white">
            Media Sharing Box
          </div>
        )}
      </div>
    </div>
  );
};

export default MediaSharingBox;