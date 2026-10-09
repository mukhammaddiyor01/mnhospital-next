export function servicePriceForDisplay(
	service: { servicePrice: number; serviceDiscountPercent?: number | null },
	currency: string,
) {
	const factor = currency === 'KRW' ? 1 : 100;
	const base = Math.round(service.servicePrice * factor);
	const percent = Math.max(0, Math.min(100, service.serviceDiscountPercent ?? 0));
	return (base - Math.round((base * percent) / 100)) / factor;
}
