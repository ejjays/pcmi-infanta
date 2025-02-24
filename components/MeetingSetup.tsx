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
  // https://getstream.io/video/docs/react/guides/call-and-participant-state/#call-state
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

  // https://getstream.io/video/docs/react/ui-cookbook/replacing-call-controls/
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
    <div className="w-full max-w-[600px] relative"> 
      <div className="w-full"> 
        {/* Using CSS classes for responsive height */}
        <VideoPreview className="w-full rounded-lg overflow-hidden bg-gray-900 object-cover h-[40vh] lg:h-[30vh]" />
      </div>
    </div>
    <div className="flex h-16 items-center justify-center gap-3">
      <label className="flex items-center justify-center gap-2 font-medium">
        <input
          type="checkbox"
          checked={isMicCamToggled}
          onChange={(e) => setIsMicCamToggled(e.target.checked)}
        />
        Join with mic and camera off
      </label>
      <DeviceSettings />
    </div>
    <Button
      className="rounded-md bg-green-500 px-4 py-2.5"
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
