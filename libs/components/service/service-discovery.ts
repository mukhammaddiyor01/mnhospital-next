import { ServiceType } from './enums/service.enum';
export interface ServiceFilters {
	text: string;
	category: string;
	min: string;
	max: string;
	sort: string;
	discounted: boolean;
}
export const emptyServiceFilters: ServiceFilters = {
	text: '',
	category: '',
	min: '',
	max: '',
	sort: 'recommended',
	discounted: false,
};
const sorts: Record<string, { sort: string; direction: 'ASC' | 'DESC' }> = {
	recommended: { sort: 'serviceRank', direction: 'DESC' },
	newest: { sort: 'createdAt', direction: 'DESC' },
	low: { sort: 'servicePrice', direction: 'ASC' },
	high: { sort: 'servicePrice', direction: 'DESC' },
	popular: { sort: 'serviceViews', direction: 'DESC' },
};
export function validPriceRange(filters: ServiceFilters) {
	const values = [filters.min, filters.max];
	return (
		values.every(
			(value) =>
				value === '' ||
				(Number.isFinite(Number(value)) &&
					Number(value) >= 0 &&
					Number(value) <= 1e9 &&
					Number(value) === Math.round(Number(value) * 100) / 100),
		) &&
		(!filters.max || Number(filters.max) >= Number(filters.min || 0))
	);
}
export function serviceInquiry(filters: ServiceFilters, page = 1, limit = 6) {
	return {
		page,
		limit,
		...(sorts[filters.sort] || sorts.recommended),
		search: {
			...(filters.text.trim() ? { text: filters.text.trim() } : {}),
			...(filters.category ? { serviceTypeList: [filters.category] } : {}),
			...(filters.discounted ? { discountedOnly: true } : {}),
			...(validPriceRange(filters) && (filters.min || filters.max)
				? {
						priceRange: {
							start: Number(filters.min || 0),
							end: Number(filters.max || 1e9),
						},
					}
				: {}),
		},
	};
}
export function filtersFromQuery(
	query: Record<string, string | string[] | undefined>,
): ServiceFilters {
	const value = (key: string) =>
		typeof query[key] === 'string' ? (query[key] as string) : '';
	const filter = {
		text: value('q').slice(0, 100),
		category: Object.values(ServiceType).includes(
			value('category') as ServiceType,
		)
			? value('category')
			: '',
		min: value('min'),
		max: value('max'),
		sort: Object.prototype.hasOwnProperty.call(sorts, value('sort'))
			? value('sort')
			: 'recommended',
		discounted: value('discounted') === 'true',
	};
	return validPriceRange(filter) ? filter : { ...filter, min: '', max: '' };
}
export function filtersToQuery(filters: ServiceFilters, page: number) {
	return {
		...(filters.text.trim() ? { q: filters.text.trim() } : {}),
		...(filters.category ? { category: filters.category } : {}),
		...(filters.min ? { min: filters.min } : {}),
		...(filters.max ? { max: filters.max } : {}),
		...(filters.sort !== 'recommended' ? { sort: filters.sort } : {}),
		...(filters.discounted ? { discounted: 'true' } : {}),
		...(page > 1 ? { page: String(page) } : {}),
	};
}
