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

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-3 text-white p-4">
      <h1 className="text-center text-2xl font-bold mb-4">Setup</h1>
      
      {/* Added mobile-first container with proper width constraints */}
      <div className="w-full max-w-[90%] md:max-w-[500px] mx-auto flex flex-col items-center">
        {/* Video preview container with better mobile sizing */}
        <div className="w-full relative mb-6"> 
          <div className="aspect-video w-full">
            <VideoPreview 
              className="w-full h-full rounded-lg overflow-hidden bg-gray-900 object-cover"
            />
          </div>
        </div>

        {/* Controls container with better spacing and mobile width */}
        <div className="w-full flex flex-col gap-4">
          <label className="flex items-center justify-center gap-2">
            <input
              type="checkbox"
              checked={isMicCamToggled}
              onChange={(e) => setIsMicCamToggled(e.target.checked)}
              className="h-5 w-5" // Increased touch target size
            />
            <span className="text-sm md:text-base">Join with mic and camera off</span>
          </label>

          {/* Device settings with full width */}
          <div className="w-full">
            <DeviceSettings />
          </div>

          {/* Join button with proper mobile sizing */}
          <Button
            className="w-full bg-green-500 py-3 text-base rounded-lg mt-2"
            onClick={() => {
              console.log("Joining call with MicCamToggled:", isMicCamToggled);
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