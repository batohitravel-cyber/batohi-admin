
import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface TimingsEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function TimingsEditor({ value, onChange }: TimingsEditorProps) {
  // Try to extract start/end from "10:00 AM - 06:00 PM" string
  // For input type="time", we need "HH:mm" (24h)
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  // Initial load parsing (very basic)
  useEffect(() => {
    if (!value) return;
    // If value is "10:00 AM - 05:00 PM", we try to keep it compatible
    // But converting back to 24h for the input is tricky without a lib if we want to be robust.
    // For now, let's assume if it doesn't match HH:mm, we just default to empty or try to regex.
    // If the user already set it via this component, we can't easily reverse "10:00 AM" -> "10:00" reliably without more code.
    // Let's just respect the input if the user changes it.

    // OPTIONAL: Try to parse "10:00 AM" -> "10:00"
    const parseTo24 = (t: string) => {
      const match = t.match(/(\d+):(\d+)\s?(AM|PM)/i);
      if (match) {
        let [_, h, m, ap] = match;
        let hh = parseInt(h);
        if (ap.toUpperCase() === 'PM' && hh < 12) hh += 12;
        if (ap.toUpperCase() === 'AM' && hh === 12) hh = 0;
        return `${hh.toString().padStart(2, '0')}:${m}`;
      }
      return ''; // naive fallback
    };

    if (value.includes(' - ')) {
      const [s, e] = value.split(' - ');
      const s24 = parseTo24(s);
      const e24 = parseTo24(e);
      if (s24) setStartTime(s24);
      if (e24) setEndTime(e24);
    }
  }, []);

  const handleStart = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value; // "13:00"
    setStartTime(val);
    emitChange(val, endTime);
  };

  const handleEnd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEndTime(val);
    emitChange(startTime, val);
  };

  const emitChange = (s: string, e: string) => {
    if (!s || !e) {
      onChange(`${s} - ${e}`);
      return;
    }

    const format = (t: string) => {
      if (!t) return '';
      const [h, m] = t.split(':');
      const d = new Date();
      d.setHours(+h);
      d.setMinutes(+m);
      return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    };

    onChange(`${format(s)} - ${format(e)}`);
  };

  return (
    <div className="flex gap-4 items-center border p-4 rounded-md bg-muted/10">
      <div className="grid gap-1.5 flex-1">
        <Label className="text-xs font-semibold text-muted-foreground uppercase">Opening</Label>
        <Input
          type="time"
          value={startTime}
          onChange={handleStart}
          className="font-mono"
        />
      </div>
      <span className="mt-6 font-bold text-muted-foreground">-</span>
      <div className="grid gap-1.5 flex-1">
        <Label className="text-xs font-semibold text-muted-foreground uppercase">Closing</Label>
        <Input
          type="time"
          value={endTime}
          onChange={handleEnd}
          className="font-mono"
        />
      </div>
      <div className="mt-6 text-sm text-muted-foreground w-32 text-right">
        <span className="font-medium text-foreground">{value || 'No time set'}</span>
      </div>
    </div>
  );
}
