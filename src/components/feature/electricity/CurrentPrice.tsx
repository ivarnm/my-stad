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

  const formatPrice = (price: number) => {
    return price.toFixed(2).replace('.', ',') + ' kr';
  }

  if (!currentDataPoint) {
    return null;
  }


  return (
    <div className='flex flex-col items-end absolute top-3 right-4'>
      <span className='text-lg'>{formatPrice(currentDataPoint.priceWithSubsidy)}</span>
      <span className='text-xs'>per kWh</span>
    </div>
  )
}
