export const formatKrw = (amount?: number | string) => `${Number(amount ?? 0).toLocaleString('ko-KR')} KRW`;
export const formatMoney = (amount?: number | string, currency = 'UZS') => `${Number(amount ?? 0).toLocaleString('en-US')} ${currency}`;
