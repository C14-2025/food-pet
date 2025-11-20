'use client';

import * as React from 'react';
import { type DateRange } from 'react-day-picker';
import { Calendar } from '@/components/ui/calendar';

interface CalendarRangeProps {
  from?: Date;
  to?: Date;
  onChange?: (range: DateRange) => void;
}

export function CalendarRange({ from, to, onChange }: CalendarRangeProps) {
  const selected: DateRange = { from, to };

  return (
    <Calendar
      mode='range'
      defaultMonth={from}
      selected={selected}
      onSelect={(range) => {
        if (onChange) onChange(range as DateRange);
      }}
      numberOfMonths={1}
      className='rounded-lg border shadow-sm'
    />
  );
}
