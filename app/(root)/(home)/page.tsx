'use client'; // This enables the use of useEffect and useState

import React, { useEffect, useState } from 'react';
import MeetingTypeList from '@/components/MeetingTypeList';

const Home = () => {
  const [dateTime, setDateTime] = useState(new Date());

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId); // Clean up the interval on unmount
  }, []);

  const localTime = new Date(dateTime.toLocaleString('en-PH', { timeZone: 'Asia/Manila' }));

  const hoursMinutes = localTime.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }).split(' ');
  const hoursMinutesPart = hoursMinutes[0];
  const amPmPart = hoursMinutes[1];
  const seconds = localTime.getSeconds().toString().padStart(2, '0'); // Ensure 2 digits

  const date = new Intl.DateTimeFormat('en-PH', { dateStyle: 'full' }).format(localTime);

  return (
    <section className="flex size-full flex-col gap-5 text-white">
      <div className="h-[303px] w-full rounded-[20px] bg-hero bg-cover">
        <div className="flex h-full flex-col justify-between max-md:px-5 max-md:py-8 lg:p-11">
          <h2 className="glassmorphism max-w-[273px] rounded py-2 text-center text-base font-normal">
            Cellgroup Saturday at 9:00 PM
          </h2>
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold lg:text-7xl">
              {hoursMinutesPart} {amPmPart}
              <span className="text-3xl font-extrabold text-white align-baseline"> {seconds}s</span>
            </h1>
            <p className="text-lg font-medium text-sky-1 lg:text-2xl">{date}</p>
          </div>
        </div>
      </div>
      <MeetingTypeList />
    </section>
  );
};

export default Home;