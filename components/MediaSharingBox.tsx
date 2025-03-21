'use client';

const MediaSharingBox = () => {
  return (
    <div className="w-full mb-2">
      <div className="aspect-video bg-dark-1 rounded-lg overflow-hidden relative">
        <div className="absolute bottom-2 left-2 bg-black/50 px-2 py-1 rounded text-sm text-white">
          Media Sharing Box
        </div>
      </div>
    </div>
  );
};

export default MediaSharingBox;