import React from 'react'

const formatTime = (date: Date) => date.toLocaleTimeString(['nb-NO'], { hour: '2-digit', minute: '2-digit' });

const SunTimeDisplay = ({ label, time, icon }: { label: string; time: Date, icon: string }) => (
  <div className='flex items-center gap-4'>
    <span className={`material-symbols-outlined ${label === 'Sunrise' ? 'text-[#FF8904]' : 'text-[#F54900]'}`}>
      {icon}
    </span>
    <div className='flex flex-col items-center'>
      <p className="text-(--text-subtle) text-sm">{label}</p>
      <p className="text-lg font-medium">{formatTime(time)}</p>
    </div>
  </div>
);

export default function SunTimes({ sunrise, sunset }: { sunrise: Date; sunset: Date }) {
  return (
    <div className='flex items-center justify-evenly bg-(--surface-muted) rounded-md py-2'>
      <SunTimeDisplay label="Sunrise" time={sunrise} icon="wb_twilight" />
      <span className='w-px h-8 bg-[#404040]'></span>
      <SunTimeDisplay label="Sunset" time={sunset} icon="water_lux" />
    </div>
  )
}
