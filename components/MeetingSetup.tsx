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
    <div className="flex h-screen w-full flex-col items-center justify-center gap-3 text-white px-4">
      <h1 className="text-center text-2xl font-bold">Setup</h1>
      <div className="flex flex-col items-center w-full">
        {/* Updated video preview container with better mobile responsiveness */}
        <div className="w-full max-w-[500px] mx-auto relative px-4 sm:px-0"> 
          <div className="aspect-video w-full">
            <VideoPreview className="w-full h-full rounded-lg overflow-hidden bg-gray-900 object-cover" />
          </div>
        </div>
      </div>
      
      {/* Updated controls layout */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-[500px] px-4">
        <label className="flex items-center justify-center gap-2 font-medium text-sm sm:text-base">
          <input
            type="checkbox"
            checked={isMicCamToggled}
            onChange={(e) => setIsMicCamToggled(e.target.checked)}
          />
          Join with mic and camera off
        </label>
        <DeviceSettings />
      </div>
      
      {/* Updated join button */}
      <Button
        className="rounded-md bg-green-500 px-4 py-2.5 w-full max-w-[500px] mx-4"
        onClick={() => {
          console.log("Joining call with MicCamToggled:", isMicCamToggled);
          call.join();
          setIsSetupComplete(true);
        }}
      >
        Join meeting
      </Button>
    </div>
  );
};

export default MeetingSetup;