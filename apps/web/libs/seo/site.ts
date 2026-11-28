export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://mnhospital.uz').replace(/\/$/, '');
export const SOCIAL_IMAGE = `${SITE_URL}/img/hospital-care-1.png`;

export type SeoMeta = {
	title: string;
	description: string;
};

const publicPages: Record<string, SeoMeta> = {
	'/': {
		title: 'MN Hospital | Medical services and appointments in Korea',
		description: 'Explore MN Hospital services, meet our doctors and choose an available appointment. Review care options and booking details before payment.',
	},
	'/service': {
		title: 'Medical Services | MN Hospital',
		description: 'Compare MN Hospital medical services, doctors, appointment durations and prices. Find a service that fits your care needs.',
	},
	'/doctor': {
		title: 'Our Doctors | MN Hospital',
		description: 'Meet MN Hospital doctors, explore their specialties and services, and choose an available appointment.',
	},
	'/article': {
		title: 'Health Articles | MN Hospital',
		description: 'Read health and wellness articles from the MN Hospital community.',
	},
	'/about': {
		title: 'About MN Hospital | Patient-centered care',
		description: 'Learn about MN Hospital and our approach to clear, thoughtful patient care.',
	},
	'/contact': {
		title: 'Contact MN Hospital',
		description: 'Find MN Hospital contact information and ways to ask about your visit.',
	},
	'/visit-guide': {
		title: 'Plan Your Visit | MN Hospital',
		description: 'Prepare for your MN Hospital appointment in Korea: booking, documents, arrival and clinic time-zone guidance.',
	},
	'/notices': {
		title: 'Hospital Notices | MN Hospital',
		description: 'Read the latest public notices and updates from MN Hospital.',
	},
};

export const sitemapPaths = Object.keys(publicPages);

export function seoForPath(path: string, override?: SeoMeta | null): SeoMeta {
	if (override) return override;
	if (path === '/404' || path === '/_error') return { title: 'Page unavailable | MN Hospital', description: 'This page is unavailable. Explore MN Hospital services, doctors and visit information.' };
	if (path.startsWith('/account/')) return { title: 'Account | MN Hospital', description: 'Sign in to your MN Hospital account.' };
	if (path.startsWith('/mypage') || path.startsWith('/patient/')) return { title: 'Patient account | MN Hospital', description: 'Manage your MN Hospital account and visits.' };
	if (path === '/appointment' || path.startsWith('/booking/')) return { title: 'Appointment and booking | MN Hospital', description: 'Manage your MN Hospital appointment and booking.' };
	if (path.startsWith('/service/')) return { title: 'Medical Service | MN Hospital', description: publicPages['/service'].description };
	if (path.startsWith('/doctor/')) return { title: 'Doctor Profile | MN Hospital', description: publicPages['/doctor'].description };
	if (path.startsWith('/article/')) return { title: 'Health Article | MN Hospital', description: publicPages['/article'].description };
	return publicPages[path] ?? { title: 'Workspace | MN Hospital', description: 'MN Hospital account workspace.' };
}

export function isIndexablePath(path: string): boolean {
	return Boolean(publicPages[path] || /^\/(service|doctor|article)\/[a-f\d]{24}$/i.test(path));
}

export function canonicalPath(asPath: string): string {
	const path = asPath.split(/[?#]/, 1)[0] || '/';
	const trimmed = path !== '/' ? path.replace(/\/$/, '') : path;
	return /^\/(service|doctor|article)\/[a-f\d]{24}$/i.test(trimmed) ? trimmed.toLowerCase() : trimmed;
}
