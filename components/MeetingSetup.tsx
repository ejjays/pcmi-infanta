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
    
    {/* Main container with strict mobile constraints */}
    <div className="w-full max-w-[320px] sm:max-w-[400px] mx-auto flex flex-col items-center">
      {/* Video preview with fixed mobile dimensions */}
      <div className="w-full aspect-[4/3] mb-4"> 
        <div className="relative h-full w-full">
          <VideoPreview 
            className="absolute inset-0 rounded-lg overflow-hidden bg-gray-900 object-cover"
          />
        </div>
      </div>

      {/* Controls with proper mobile spacing */}
      <div className="w-full space-y-3">
        <label className="flex items-center justify-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isMicCamToggled}
            onChange={(e) => setIsMicCamToggled(e.target.checked)}
            className="h-4 w-4"
          />
          Join with mic and camera off
        </label>

        {/* Device settings */}
        <div className="w-full">
          <DeviceSettings />
        </div>

        {/* Join button */}
        <Button
          className="w-full bg-green-500 py-2.5 text-sm rounded-lg"
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