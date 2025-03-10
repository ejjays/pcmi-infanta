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
    <div className="flex min-h-screen w-full flex-col items-center justify-center gap-3 text-white px-4 py-8">
      <h1 className="text-center text-2xl font-bold">Setup</h1>
      
      {/* Main container with better mobile spacing */}
      <div className="flex flex-col items-center w-full max-w-[500px] mx-auto">
        {/* Video preview container with adjusted height and padding */}
        <div className="w-full relative mb-4"> 
          <div className="aspect-video w-full">
            <VideoPreview 
              className="w-full h-full rounded-lg overflow-hidden bg-gray-900 object-cover"
            />
          </div>
        </div>

        {/* Controls with better spacing */}
        <div className="flex flex-col w-full gap-4 px-4">
          <label className="flex items-center justify-center gap-2 font-medium">
            <input
              type="checkbox"
              checked={isMicCamToggled}
              onChange={(e) => setIsMicCamToggled(e.target.checked)}
              className="h-4 w-4"
            />
            <span className="text-sm">Join with mic and camera off</span>
          </label>

          {/* Device settings with proper spacing */}
          <div className="w-full">
            <DeviceSettings />
          </div>

          {/* Join button with proper spacing */}
          <Button
            className="w-full bg-green-500 py-3 rounded-lg mt-2"
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