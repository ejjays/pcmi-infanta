'use client'; 

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import HomeCard from './HomeCard';
import MeetingModal from './MeetingModal';
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk';
import { useUser } from '@clerk/nextjs';
import Loader from './Loader';
import { Textarea } from './ui/textarea';
import ReactDatePicker from 'react-datepicker';
import { useToast } from './ui/use-toast';
import { Input } from './ui/input';
import { useNotifications } from '@/context/NotificationContext';

const initialValues = {
  dateTime: new Date(),
  description: '',
  link: '',
};

const MeetingTypeList = () => {
  const { enableNotifications } = useNotifications();
  const router = useRouter();
  const [meetingState, setMeetingState] = useState<
    'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | 'isUnauthorized' | undefined
  >(undefined);
  const [values, setValues] = useState(initialValues);
  const [callDetail, setCallDetail] = useState<Call>();
  const [code, setCode] = useState(['', '', '', '']);
  const client = useStreamVideoClient();
  const { user } = useUser();
  const { toast } = useToast();

  const inputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ];
  
  const ADMIN_CREDENTIALS = [
    {
      code: "0618",
      link: "PersonaLinkuser_2qbNobut11rUklLIMzmd5nQ8yc1"
    },
    {
      code: "7777",
      link: "PersonaLinkuser_2sABqr7qHlfl0Sf3Goi4UAYk1Z7"
    }, 
    {
      code: "2115",
      link: "PersonaLinkuser_2pNBsKMcT3yj2PXM3XbImRjcYVG"
    } 
  ];

  const ALLOWED_ADMIN_IDS = [
    "user_2sABqr7qHlfl0Sf3Goi4UAYk1Z7",
    "user_2qbNobut11rUklLIMzmd5nQ8yc1", 
    "user_2pNBsKMcT3yj2PXM3XbImRjcYVG"
  ];

  const createMeeting = async () => {
    if (!client || !user) return;
    try {
      if (!values.dateTime) {
        toast({ title: 'Please select a date and time' });
        return;
      }
      const id = user.id;
      const call = client.call('default', id);
      if (!call) throw new Error('Failed to create meeting');
      const startsAt =
        values.dateTime.toISOString() || new Date(Date.now()).toISOString();
      const description = values.description || 'Instant Meeting';
      await call.getOrCreate({
        data: {
          starts_at: startsAt,
          custom: {
            description,
          },
        },
      });
      setCallDetail(call);

      // If this is an instant meeting and the user is an admin, notify participants
      if (!values.description && ALLOWED_ADMIN_IDS.includes(user?.id)) {
        console.log("Admin started an instant meeting, sending notifications...");
        
        const response = await fetch('/api/notify-participants', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            meetingId: call.id,
            meetingTitle: 'Instant Meeting Started',
            message: `${user.firstName || 'An admin'} has started an instant meeting. Join now!`,
            url: `/meeting/${call.id}`
          }),
        });
        
        const result = await response.json();
        console.log("Notification API response:", result);
        
        if (response.ok) {
          toast({
            title: "Notifications sent",
            description: `Sent to ${result.sentCount || 0} users`,
          });
        } else {
          console.error("Failed to send notifications:", result);
          toast({
            title: "Notification issue",
            description: result.error || "There was a problem sending notifications",
            variant: "error"
          });
        }
      }

      router.push(`/meeting/${call.id}`);
      toast({
        title: 'Meeting Created',
      });
    } catch (error) {
      console.error(error);
      toast({ title: 'Failed to create Meeting' });
    }
  };

  if (!client || !user) return <Loader />;

  const meetingLink = `${process.env.NEXT_PUBLIC_BASE_URL}/meeting/${callDetail?.id}`;

  return (
    <section className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
      <HomeCard
        img="/icons/add-meeting.svg"
        title="New Meeting"
        description="Start an instant meeting"
        handleClick={() => {
          if (ALLOWED_ADMIN_IDS.includes(user?.id)) {
            setMeetingState('isInstantMeeting');
          } else {
            setMeetingState('isUnauthorized');
          }
        }}
      />
      <HomeCard
        img="/icons/join-meeting.svg"
        title="Join Meeting"
        description="Via passcode"
        className="bg-blue-1"
        handleClick={() => setMeetingState('isJoiningMeeting')}
      />
      <HomeCard
        img="/icons/schedule.svg"
        title="Schedule Meeting"
        description="Plan your meeting"
        className="bg-purple-1"
        handleClick={() => setMeetingState('isScheduleMeeting')}
      />
      <HomeCard
        img="/icons/recordings.svg"
        title="View Recordings"
        description="Meeting Recordings"
        className="bg-yellow-1"
        handleClick={() => router.push('/recordings')}
      />

      {!callDetail ? (
        <MeetingModal
          isOpen={meetingState === 'isScheduleMeeting'}
          onClose={() => setMeetingState(undefined)}
          title="Create Meeting"
          handleClick={createMeeting}
        >
          <div className="flex flex-col gap-2.5">
            <label className="text-base font-normal leading-[22.4px] text-sky-2">
              Add a description
            </label>
            <Textarea
              className="border-none bg-dark-3 focus-visible:ring-0 focus-visible:ring-offset-0"
              onChange={(e) =>
                setValues({ ...values, description: e.target.value })
              }
            />
          </div>
          <div className="flex w-full flex-col gap-2.5">
            <label className="text-base font-normal leading-[22.4px] text-sky-2">
              Select Date and Time
            </label>
            <ReactDatePicker
              selected={values.dateTime}
              onChange={(date: Date | null) => setValues({ ...values, dateTime: date! })}
              showTimeSelect
              timeFormat="HH:mm"
              timeIntervals={15}
              timeCaption="time"
              dateFormat="MMMM d, yyyy h:mm aa"
              className="w-full rounded bg-dark-3 p-2 focus:outline-none"
            />
          </div>
        </MeetingModal>
      ) : (
        <MeetingModal
          isOpen={meetingState === 'isScheduleMeeting'}
          onClose={() => setMeetingState(undefined)}
          title="Meeting Created"
          handleClick={() => {
            navigator.clipboard.writeText(meetingLink);
            toast({ title: 'Link Copied' });
          }}
          image={'/icons/checked.svg'}
          buttonIcon="/icons/copy.svg"
          className="text-center"
          buttonText="Copy Meeting Link"
        />
      )}

      <MeetingModal
        isOpen={meetingState === 'isJoiningMeeting'}
        onClose={() => setMeetingState(undefined)}
        title="Join a Meeting"
        className="text-center"
        buttonText="Join Meeting"
        handleClick={() => {
          const enteredCode = code.join('');
          const matchingAdmin = ADMIN_CREDENTIALS.find(admin => admin.code === enteredCode);
          
          if (matchingAdmin) {
            const userId = matchingAdmin.link.replace('PersonaLink', '');
            const fullLink = `https://pcmi-infanta.vercel.app/meeting/${userId}?personal=true`;
            router.push(fullLink);
          } else {
            toast({
              title: "Invalid Code",
              description: "The meeting code you entered is incorrect",
              variant: "error",
            });
          }
        }}
      >
        <div className="flex flex-col items-center gap-4">
          <label className="text-base font-normal leading-[22.4px] text-sky-2">
            Enter Meeting Passcode
          </label>
          <div className="flex justify-center gap-4 my-4">
            {[0, 1, 2, 3].map((index) => (
              <Input
                key={index}
                ref={inputRefs[index]}
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={1}
                value={code[index]}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  const newCode = [...code];
                  newCode[index] = value;
                  setCode(newCode);
                  
                  if (value && index < 3) {
                    inputRefs[index + 1].current?.focus();
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && !code[index] && index > 0) {
                    inputRefs[index - 1].current?.focus();
                  }
                }}
                className="size-12 rounded-md border-none bg-dark-3 text-center text-2xl 
                          focus:border-blue-500 focus:ring-blue-500
                          focus-visible:ring-0 focus-visible:ring-offset-0"
              />
            ))}
          </div>
        </div>
      </MeetingModal>

      <MeetingModal
        isOpen={meetingState === 'isUnauthorized'}
        onClose={() => setMeetingState(undefined)}
        title="Only for Admins"
        className="text-center"
        buttonText="Close"
        image="/icons/lock.svg"
        handleClick={() => setMeetingState(undefined)}  // Add this line
      >
        <div className="flex flex-col items-center justify-center w-full gap-4">
          <p className="text-base text-sky-2 text-center w-full">
            This feature is only available for administrators.
          </p>
        </div>
      </MeetingModal>

      <MeetingModal
        isOpen={meetingState === 'isInstantMeeting'}
        onClose={() => setMeetingState(undefined)}
        title="Start an Instant Meeting"
        className="text-center"
        buttonText="Start Meeting"
        handleClick={createMeeting}
      />
    </section>
  );
};

export default MeetingTypeList;