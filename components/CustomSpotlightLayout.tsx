import React from 'react';
import { useCallStateHooks, VideoTrack } from '@stream-io/video-react-sdk';

const CustomSpotlightLayout = () => {
  const { useParticipants } = useCallStateHooks();
  const participants = useParticipants();

  const mainParticipant = participants[0]; // Assuming the first participant is the spotlight
  const otherParticipants = participants.slice(1);

  return (
    <div className="spotlight-layout">
      {mainParticipant && (
        <div className="main-participant">
          {/* Main participant video stream */}
          <VideoTrack participant={mainParticipant} />
        </div>
      )}
      <div className="other-participants">
        {otherParticipants.map(participant => (
          <div key={participant.id} className="participant">
            {/* Other participants video stream */}
            <VideoTrack participant={participant} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomSpotlightLayout;