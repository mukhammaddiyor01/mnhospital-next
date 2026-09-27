export const formatKrw = (amount?: number | string) => `${Number(amount ?? 0).toLocaleString('ko-KR')} KRW`;
