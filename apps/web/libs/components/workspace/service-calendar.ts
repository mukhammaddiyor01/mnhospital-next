export function datesInRange(start: string, end: string): string[] {
 const first = Date.parse(`${start}T00:00:00Z`), last = Date.parse(`${end}T00:00:00Z`);
 if (!/^\d{4}-\d{2}-\d{2}$/.test(start) || !/^\d{4}-\d{2}-\d{2}$/.test(end)) return [];
 if (!Number.isFinite(first) || !Number.isFinite(last) || last < first || (last - first) / 86400000 >= 366) return [];
 if (new Date(first).toISOString().slice(0,10) !== start || new Date(last).toISOString().slice(0,10) !== end) return [];
 const days: string[] = [];
 for (let day = first; day <= last; day += 86400000) days.push(new Date(day).toISOString().slice(0,10));
 return days;
}
