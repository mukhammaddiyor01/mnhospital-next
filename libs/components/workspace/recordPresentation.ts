/** Compact labels for legacy UUID references. Full IDs remain API keys. */
export function recordReference(value?: string | null): string {
	if (!value) return '—';
	const match =
		/^(APT|BO)-([a-f\d]{8})-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{4}-[a-f\d]{12}$/i.exec(
			value,
		);
	return match ? `${match[1].toUpperCase()}-${match[2].toUpperCase()}` : value;
}
