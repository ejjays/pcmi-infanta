'use client';
import { useEffect, useState } from 'react';
import {
  DeviceSettings,
  VideoPreview,
  useCall,
  useCallStateHooks,
} from '@stream-io/video-react-sdk';

import Alert from './Alert';
import { Button } from './ui/button';

const MeetingSetup = ({
  setIsSetupComplete,
}: {
  setIsSetupComplete: (value: boolean) => void;
}) => {
  const { useCallEndedAt, useCallStartsAt } = useCallStateHooks();
  const callStartsAt = useCallStartsAt();
  const callEndedAt = useCallEndedAt();
  const callTimeNotArrived =
    callStartsAt && new Date(callStartsAt) > new Date();
  const callHasEnded = !!callEndedAt;

  const call = useCall();

  if (!call) {
    throw new Error(
      'useStreamCall must be used within a StreamCall component.',
    );
  }

  const [isMicCamToggled, setIsMicCamToggled] = useState(false);

  useEffect(() => {
    console.log("MicCamToggled:", isMicCamToggled);
    if (isMicCamToggled) {
      call.camera.disable();
      call.microphone.disable();
    } else {
      call.camera.enable();
      call.microphone.enable();
    }
  }, [isMicCamToggled, call.camera, call.microphone]);

  if (callTimeNotArrived)
    return (
      <Alert
        title={`Your Meeting has not started yet. It is scheduled for ${callStartsAt.toLocaleString()}`}
      />
    );

  if (callHasEnded)
    return (
      <Alert
        title="The call has been ended by the host"
        iconUrl="/icons/call-ended.svg"
      />
    );

// MeetingSetup.tsx
return (
  <div className="flex min-h-screen w-full flex-col items-center justify-center p-2 text-white">
    <h1 className="text-center text-xl font-bold mb-4">Setup</h1>
    
    {/* Super strict container with fixed width */}
    <div className="w-[280px] mx-auto"> {/* Fixed width that works on all devices */}
      {/* Video preview with forced dimensions */}
      <div className="w-[280px] mb-4"> {/* Matching fixed width */}
        <div className="relative aspect-video w-full">
          <VideoPreview 
            className="absolute inset-0 rounded-lg overflow-hidden bg-gray-900 object-contain"
          />
        </div>
      </div>

      {/* Controls with fixed width */}
      <div className="w-[280px] space-y-3"> {/* Matching fixed width */}
        <label className="flex items-center justify-start gap-2 text-xs">
          <input
            type="checkbox"
            checked={isMicCamToggled}
            onChange={(e) => setIsMicCamToggled(e.target.checked)}
            className="h-4 w-4"
          />
          <span>Join with mic and camera off</span>
        </label>

        {/* Device settings with forced width */}
        <div className="w-[280px]"> {/* Matching fixed width */}
          <DeviceSettings />
        </div>

        <Button
          className="w-full bg-green-500 py-2 text-sm rounded-lg"
          onClick={() => {
            call.join();
            setIsSetupComplete(true);
          }}
        >
          Join meeting
        </Button>
      </div>
    </div>
  </div>
);
};

export default MeetingSetup;