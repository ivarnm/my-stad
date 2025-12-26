"use client";

import { useMemo } from 'react';
import { ElectricityPrices } from 'src/server/actions/electricity';

export default function CurrentPrice({ data }: { data: ElectricityPrices | undefined }) {
  const currentDataPoint = useMemo(() => {
    const now = new Date();
    return data?.today.find((d) => {
      const date = new Date(d.time);
      return (
        date.getDate() === now.getDate() &&
        date.getHours() === now.getHours() &&
        date.getMonth() === now.getMonth() &&
        date.getFullYear() === now.getFullYear()
      );
    });
  }, [data]);

  if (!currentDataPoint) {
    return null;
  }


  return (
    <div className='flex flex-col items-end'>
      <span className='text-xl'>{currentDataPoint.pricePerKWh.toFixed(2).replace('.', ',')} kr</span>
      <span className='text-sm'>per kWh</span>
    </div>
  )
}
