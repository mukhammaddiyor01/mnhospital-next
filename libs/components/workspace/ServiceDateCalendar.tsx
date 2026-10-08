import { datesInRange } from './service-calendar';
import { useState } from 'react';
import { usePreferences } from '@/libs/components/preference/PreferenceProvider';
import { clinicToday } from '@/libs/payments/clinic';
import { useClinicSettings } from '@/libs/payments/useClinicSettings';
import styles from './ServiceDateCalendar.module.scss';

const copy = {
 EN: { title: 'Service dates', all: 'Weekly schedule', selected: 'Select days', range: 'Date range', month: 'Select this month', clear: 'Clear dates', from: 'From', to: 'Through', help: 'Available times follow your working schedule, breaks and existing bookings. With no selected dates, the weekly schedule applies.', count: 'Selected days', limit: 'Choose up to 366 days.', prev: 'Previous month', next: 'Next month' },
 UZ: { title: 'Xizmat sanalari', all: 'Haftalik jadval', selected: 'Kunlarni tanlash', range: 'Muddat oralig‘i', month: 'Shu oyni tanlash', clear: 'Sanalarni tozalash', from: 'Boshlanish', to: 'Tugash', help: 'Vaqtlar ish jadvalingiz, tanaffus va mavjud bronlarga mos chiqadi. Sana tanlanmasa, haftalik jadval amal qiladi.', count: 'Tanlangan kunlar', limit: '366 kungacha tanlang.', prev: 'Oldingi oy', next: 'Keyingi oy' },
 KR: { title: '서비스 날짜', all: '주간 일정', selected: '날짜 선택', range: '기간 선택', month: '이번 달 선택', clear: '날짜 지우기', from: '시작일', to: '종료일', help: '예약 시간은 근무 일정, 휴식 시간 및 기존 예약에 따라 정해집니다. 날짜를 선택하지 않으면 주간 일정이 적용됩니다.', count: '선택한 날짜', limit: '최대 366일을 선택하세요.', prev: '이전 달', next: '다음 달' },
};
export default function ServiceDateCalendar({ value, onChange }: { value: string[]; onChange: (days: string[]) => void }) {
 const { language } = usePreferences();
 const text = copy[language];
 const clinic = useClinicSettings();
 const today = clinicToday(clinic.timeZone);
 const [month, setMonth] = useState(() => (value.find(day => day >= today) ?? today).slice(0,7));
 const [mode, setMode] = useState<'all' | 'selected' | 'range'>(value.length ? 'selected' : 'all');
 const [start, setStart] = useState('');
 const [end, setEnd] = useState('');
 const [error, setError] = useState('');
 const locale = language === 'UZ' ? 'uz-UZ' : language === 'KR' ? 'ko-KR' : 'en-US';
 const first = new Date(`${month}-01T00:00:00Z`);
 const days = new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth()+1,0)).getUTCDate();
 const offset = (first.getUTCDay()+6)%7;
 const selected = new Set(value);
 const shift = (step: number) => setMonth(new Date(Date.UTC(first.getUTCFullYear(),first.getUTCMonth()+step,1)).toISOString().slice(0,7));
 const range = (from: string, through: string) => {
  const next = datesInRange(from, through);
  setError(from && through && !next.length ? text.limit : '');
  onChange(next);
 };
 return <fieldset className={styles.calendar}>
  <legend>{text.title}</legend>
  <p>{text.help}</p>
  <div className={styles.actions}>{(['all','selected','range'] as const).map(option => <button key={option} type="button" aria-pressed={mode === option} onClick={() => { setMode(option); setError(''); if (option === 'all') onChange([]); if (option === 'range') range(start,end); }}>{text[option]}</button>)}</div>
  {mode !== 'all' && <>
   <div className={styles.actions}>
    <button type="button" aria-label={text.prev} onClick={() => shift(-1)}>‹</button>
    <strong>{new Intl.DateTimeFormat(locale,{month:'long',year:'numeric',timeZone:'UTC'}).format(first)}</strong>
    <button type="button" aria-label={text.next} onClick={() => shift(1)}>›</button>
   </div>
   {mode === 'range' && <div className={styles.actions}>
    <label>{text.from}<input type="date" min={today} required value={start} onChange={event => { setStart(event.target.value); range(event.target.value,end); }}/></label>
    <label>{text.to}<input type="date" min={start || today} max={start ? new Date(Date.parse(`${start}T00:00:00Z`)+365*86400000).toISOString().slice(0,10) : undefined} required value={end} onChange={event => { setEnd(event.target.value); range(start,event.target.value); }}/></label>
   </div>}
   <div className={styles.grid}>
    {Array.from({length:7},(_,index) => <span key={`weekday-${index}`}>{new Intl.DateTimeFormat(locale,{weekday:'short',timeZone:'UTC'}).format(new Date(Date.UTC(2024,0,1+index)))}</span>)}
    {Array.from({length:offset},(_,index) => <span key={`blank-${index}`} />)}
    {Array.from({length:days},(_,index) => { const day = `${month}-${String(index+1).padStart(2,'0')}`; return <button type="button" key={day} aria-label={day} aria-pressed={selected.has(day)} disabled={day < today || mode === 'range'} onClick={() => {
     if (selected.has(day)) onChange(value.filter(date => date !== day));
     else if (value.length < 366) onChange([...value,day].sort());
     else setError(text.limit);
    }}>{index+1}</button>; })}
   </div>
   {mode === 'selected' && <div className={styles.actions}>
    <button type="button" onClick={() => { const monthEnd = `${month}-${String(days).padStart(2,'0')}`; const next = [...new Set([...value,...datesInRange(`${month}-01`,monthEnd).filter(day => day >= today)])].sort(); if (next.length <= 366) { onChange(next); setError(''); } else setError(text.limit); }}>{text.month}</button>
    <button type="button" onClick={() => { onChange([]); setMode('all'); setError(''); }}>{text.clear}</button>
   </div>}
   <p aria-live="polite">{text.count}: {value.length}</p>
  </>}
  {error && <p role="alert">{error}</p>}
 </fieldset>;
}
