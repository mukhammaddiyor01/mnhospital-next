const apiBaseUrl = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:2001').replace(/\/$/, '');

export const resolveApiAsset = (asset?: string | null): string => {
	if (!asset) return '';
	if (/^(?:https?:|data:|blob:)/i.test(asset)) return asset;
	return `${apiBaseUrl}/${asset.replace(/^\/+/, '')}`;
};
