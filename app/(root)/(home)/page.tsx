import MeetingTypeList from '@/components/MeetingTypeList';

const Home = () => {
  // Set time zone to Asia/Manila
  const now = new Date();
  const utcOffset = -9 * 60; // UTC+9
  const localTime = new Date(now.getTime() + utcOffset * 60000);
  const adjustedTime = new Date(localTime.getTime() + 5 * 60 * 60 * 1000); // Adding 5 hours

  const time = adjustedTime.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
  const date = new Intl.DateTimeFormat('en-PH', { dateStyle: 'full' }).format(adjustedTime);
  
  return (
    <section className="flex size-full flex-col gap-5 text-white">
      <div className="h-[303px] w-full rounded-[20px] bg-hero bg-cover">
        <div className="flex h-full flex-col justify-between max-md:px-5 max-md:py-8 lg:p-11">
          <h2 className="glassmorphism max-w-[273px] rounded py-2 text-center text-base font-normal">
            Upcoming Meeting at: 12:30 PM
          </h2>
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold lg:text-7xl">{time}</h1>
            <p className="text-lg font-medium text-sky-1 lg:text-2xl">{date}</p>
          </div>
        </div>
      </div>

      <MeetingTypeList />
    </section>
  );
};

export default Home;
