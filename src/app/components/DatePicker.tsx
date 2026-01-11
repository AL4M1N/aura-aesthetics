import React, { useEffect, useRef, useState } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function formatDateISO(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function daysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

export default function DatePicker({
  id,
  value,
  onChange,
  placeholder,
}: {
  id?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState<Date>(() => (value ? new Date(value) : new Date()));
  const [selected, setSelected] = useState<Date | null>(() => (value ? new Date(value) : null));
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handle = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!(e.target instanceof Node)) return;
      if (!ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  useEffect(() => {
    if (value) {
      const d = new Date(value);
      if (!isNaN(d.getTime())) {
        setSelected(d);
        setViewDate(d);
      }
    }
  }, [value]);

  const weeks: Array<Array<number | null>> = [];
  const first = startOfMonth(viewDate);
  const dim = daysInMonth(viewDate);
  const startWeekDay = first.getDay();
  let day = 1 - startWeekDay;
  while (day <= dim) {
    const week: Array<number | null> = [];
    for (let i = 0; i < 7; i++, day++) {
      if (day < 1 || day > dim) week.push(null);
      else week.push(day);
    }
    weeks.push(week);
  }

  const selectDay = (d: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), d);
    setSelected(newDate);
    onChange(formatDateISO(newDate));
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative inline-block w-full">
      <div className="flex items-center gap-2">
        <Input
          id={id}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
          }}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          placeholder={placeholder}
          readOnly={false}
          className="pr-10"
        />
        <Button
          type="button"
          variant="ghost"
          onClick={() => setOpen((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3M3 11h18M5 21h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
          </svg>
        </Button>
      </div>

      {open && (
        <div className="absolute z-50 mt-2 w-72 bg-white border border-[#E6D4C3] rounded-md shadow-lg p-3">
          <div className="flex items-center justify-between mb-2">
            <button
              aria-label="Previous month"
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
              className="p-1 rounded hover:bg-gray-100 text-[#2D1B1B]"
            >
              <ChevronLeft size={16} className="text-[#2D1B1B]" />
            </button>

            <div className="flex items-center gap-2">
              {/* Month selector */}
              <select
                aria-label="Select month"
                value={viewDate.getMonth()}
                onChange={(e) => {
                  const m = Number(e.target.value);
                  setViewDate(new Date(viewDate.getFullYear(), m, 1));
                }}
                className="text-sm font-medium text-[#2D1B1B] bg-white border-transparent focus:outline-none"
              >
                {Array.from({ length: 12 }).map((_, i) => (
                  <option key={i} value={i}>
                    {new Date(0, i).toLocaleString(undefined, { month: 'long' })}
                  </option>
                ))}
              </select>

              {/* Year selector - descending so older years are easier to pick for DOB */}
              <select
                aria-label="Select year"
                value={viewDate.getFullYear()}
                onChange={(e) => {
                  const y = Number(e.target.value);
                  setViewDate(new Date(y, viewDate.getMonth(), 1));
                }}
                className="text-sm font-medium text-[#2D1B1B] bg-white border-transparent focus:outline-none"
              >
                {(() => {
                  const years: number[] = [];
                  const current = new Date().getFullYear();
                  const start = current - 115; // allow up to ~115 years back
                  for (let y = current; y >= start; y--) years.push(y);
                  return years.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ));
                })()}
              </select>
            </div>

            <button
              aria-label="Next month"
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
              className="p-1 rounded hover:bg-gray-100 text-[#2D1B1B]"
            >
              <ChevronRight size={16} className="text-[#2D1B1B]" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 text-xs text-center text-[#9B8B7E]">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d} className="font-medium">
                {d}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1 mt-2">
            {weeks.map((week, wi) => (
              <React.Fragment key={wi}>
                {week.map((d, di) => {
                  const isSelected = d && selected && selected.getFullYear() === viewDate.getFullYear() && selected.getMonth() === viewDate.getMonth() && selected.getDate() === d;
                  return (
                    <button
                      key={di}
                      onClick={() => d && selectDay(d)}
                      disabled={!d}
                      className={`h-8 w-8 rounded ${isSelected ? 'bg-[#D4AF77] text-white' : 'hover:bg-[#FFF8F3] text-[#2D1B1B]'}`}
                    >
                      {d ?? ''}
                    </button>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
