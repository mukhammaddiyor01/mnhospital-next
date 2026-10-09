import { FormEvent, useRef, useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { MemberType } from '../member/enums/member.enum';
import {
	GET_PROMO_CODES,
	CREATE_PROMO_CODE,
	UPDATE_PROMO_CODE,
	REMOVE_PROMO_CODE,
} from '@/apollo/promotion/operations';
import { GET_SERVICES } from '@/apollo/service/query';
import { usePromotionText } from './usePromotionText';
import { useClinicSettings } from '@/libs/payments/useClinicSettings';
import { formatMoney } from '../common/currency';
type Promo = {
	_id: string;
	code: string;
	discountType: 'PERCENT' | 'FIXED';
	discountValue: number;
	currency: string;
	isActive: boolean;
	minSubtotal: number;
	startsAt?: string;
	expiresAt?: string;
	serviceIds: string[];
};
const blank = {
	code: '',
	discountType: 'PERCENT' as Promo['discountType'],
	discountValue: '10',
	isActive: true,
	minSubtotal: '0',
	startsAt: '',
	expiresAt: '',
	serviceIds: [] as string[],
};
const localTime = (value?: string) => {
	if (!value) return '';
	const d = new Date(value);
	return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};
export default function PromoCodeManagement() {
	const text = usePromotionText(),
		clinic = useClinicSettings(),
		session = useReactiveVar(userVar);
	const allowed = Boolean(session._id && session.memberType === MemberType.ADMIN);
	const [page, setPage] = useState(1),
		[editing, setEditing] = useState<string | null | undefined>(undefined),
		[draft, setDraft] = useState(blank),
		[message, setMessage] = useState('');
	const lock = useRef(false);
	const list = useQuery<{ getPromoCodesByAdmin: { list: Promo[]; metaCounter: Array<{ total: number }> } }>(
		GET_PROMO_CODES,
		{ variables: { input: { page, limit: 10 } }, skip: !allowed, fetchPolicy: 'network-only' },
	);
	const catalog = useQuery<{
		getServices: { list: Array<{ _id: string; serviceTitle: string; serviceName: string }> };
	}>(GET_SERVICES, {
		variables: { input: { page: 1, limit: 100, search: {} } },
		skip: !allowed,
		fetchPolicy: 'cache-and-network',
	});
	const [create, creating] = useMutation(CREATE_PROMO_CODE),
		[update, updating] = useMutation(UPDATE_PROMO_CODE),
		[remove, removing] = useMutation(REMOVE_PROMO_CODE);
	const busy = creating.loading || updating.loading || removing.loading;
	const save = async (event: FormEvent) => {
		event.preventDefault();
		if (!allowed || lock.current) return;
		lock.current = true;
		setMessage('');
		try {
			const input = {
				...draft,
				code: draft.code.trim().toUpperCase(),
				discountValue: Number(draft.discountValue),
				minSubtotal: Number(draft.minSubtotal),
				startsAt: draft.startsAt ? new Date(draft.startsAt).toISOString() : null,
				expiresAt: draft.expiresAt ? new Date(draft.expiresAt).toISOString() : null,
			};
			await (editing ? update({ variables: { input: { ...input, _id: editing } } }) : create({ variables: { input } }));
			setEditing(undefined);
			await list.refetch();
			setMessage(text.saved);
		} catch (error) {
			setMessage(error instanceof Error ? error.message : 'Error');
		} finally {
			lock.current = false;
		}
	};
	const archive = async (id: string) => {
		if (!allowed || lock.current || !window.confirm(text.confirmRemove)) return;
		lock.current = true;
		setMessage('');
		try {
			await remove({ variables: { promoCodeId: id } });
			await list.refetch();
			if (editing === id) setEditing(undefined);
		} catch (error) {
			setMessage(error instanceof Error ? error.message : 'Error');
		} finally {
			lock.current = false;
		}
	};
	const total = list.data?.getPromoCodesByAdmin.metaCounter[0]?.total ?? 0;
	return (
		<section className="clinical-staff-panel clinical-admin-resource clinical-resource-panel">
			<header>
				<h2>{text.promotions}</h2>
				<button
					type="button"
					disabled={busy}
					onClick={() => {
						setEditing(null);
						setDraft(blank);
						setMessage('');
					}}
				>
					{text.create}
				</button>
			</header>
			<p>{text.help}</p>
			{list.error && (
				<p role="alert">
					{list.error.message}
					<button type="button" onClick={() => void list.refetch().catch(() => undefined)}>
						{text.retry}
					</button>
				</p>
			)}
			{editing !== undefined && (
				<form className="clinical-resource-form" onSubmit={save}>
					<fieldset className="clinical-resource-fields" disabled={busy}>
						<label>
							{text.code}
							<input
								required
								minLength={3}
								maxLength={32}
								pattern="[A-Za-z0-9_-]+"
								value={draft.code}
								onChange={(e) => setDraft((d) => ({ ...d, code: e.target.value.toUpperCase() }))}
							/>
						</label>
						<label>
							{text.discount}
							<select
								value={draft.discountType}
								onChange={(e) => setDraft((d) => ({ ...d, discountType: e.target.value as Promo['discountType'] }))}
							>
								<option value="PERCENT">{text.percent}</option>
								<option value="FIXED">
									{text.fixed} ({clinic.currency})
								</option>
							</select>
						</label>
						<label>
							{text.value}
							<input
								type="number"
								required
								min="0.01"
								max={draft.discountType === 'PERCENT' ? 100 : 1000000000}
								step="0.01"
								value={draft.discountValue}
								onChange={(e) => setDraft((d) => ({ ...d, discountValue: e.target.value }))}
							/>
						</label>
						<label>
							{text.minimum} ({clinic.currency})
							<input
								type="number"
								required
								min={0}
								max={1000000000}
								step="0.01"
								value={draft.minSubtotal}
								onChange={(e) => setDraft((d) => ({ ...d, minSubtotal: e.target.value }))}
							/>
						</label>
						<label>
							{text.starts}
							<input
								type="datetime-local"
								value={draft.startsAt}
								onChange={(e) => setDraft((d) => ({ ...d, startsAt: e.target.value }))}
							/>
						</label>
						<label>
							{text.expires}
							<input
								type="datetime-local"
								min={draft.startsAt || undefined}
								value={draft.expiresAt}
								onChange={(e) => setDraft((d) => ({ ...d, expiresAt: e.target.value }))}
							/>
						</label>
						<label>
							{text.active}
							<input
								type="checkbox"
								checked={draft.isActive}
								onChange={(e) => setDraft((d) => ({ ...d, isActive: e.target.checked }))}
							/>
						</label>
						<label>
							{text.services}
							<select
								multiple
								value={draft.serviceIds}
								disabled={catalog.loading || Boolean(catalog.error)}
								onChange={(e) =>
									setDraft((d) => ({
										...d,
										serviceIds: Array.from(e.target.selectedOptions).map((option) => option.value),
									}))
								}
							>
								{[
									...(catalog.data?.getServices.list ?? []),
									...draft.serviceIds
										.filter((id) => !(catalog.data?.getServices.list ?? []).some((s) => s._id === id))
										.map((id) => ({ _id: id, serviceTitle: id, serviceName: id })),
								].map((service) => (
									<option key={service._id} value={service._id}>
										{service.serviceTitle || service.serviceName}
									</option>
								))}
							</select>
							<small>{text.scopeHelp}</small>
						</label>
					</fieldset>
					{catalog.error && <p role="alert">{catalog.error.message}</p>}
					<div className="clinical-resource-actions">
						<button type="submit" disabled={busy}>
							{text.save}
						</button>
						<button type="button" disabled={busy} onClick={() => setEditing(undefined)}>
							{text.cancel}
						</button>
					</div>
				</form>
			)}
			{list.loading && <p role="status">{text.retry}…</p>}
			{list.data?.getPromoCodesByAdmin.list.map((promo) => (
				<article key={promo._id} className="clinical-booking-review">
					<div>
						<h3>{promo.code}</h3>
						<p>
							{promo.discountType === 'PERCENT'
								? `${promo.discountValue}%`
								: formatMoney(promo.discountValue, promo.currency)}{' '}
							· {promo.isActive ? text.active : text.inactive}
						</p>
						<small>
							{text.minimum}: {formatMoney(promo.minSubtotal, promo.currency)}
						</small>
					</div>
					<div className="clinical-resource-actions">
						<button
							type="button"
							disabled={busy}
							onClick={() => {
								setEditing(promo._id);
								setDraft({
									code: promo.code,
									discountType: promo.discountType,
									discountValue: String(promo.discountValue),
									isActive: promo.isActive,
									minSubtotal: String(promo.minSubtotal),
									startsAt: localTime(promo.startsAt),
									expiresAt: localTime(promo.expiresAt),
									serviceIds: promo.serviceIds,
								});
								setMessage('');
							}}
						>
							{text.edit}
						</button>
						<button type="button" disabled={busy} onClick={() => void archive(promo._id)}>
							{text.remove}
						</button>
					</div>
				</article>
			))}
			{!list.loading && !list.error && !list.data?.getPromoCodesByAdmin.list.length && <p>{text.empty}</p>}
			<div className="clinical-resource-actions">
				<button type="button" disabled={page <= 1 || busy || list.loading} onClick={() => setPage((n) => n - 1)}>
					{text.previous}
				</button>
				<span>{page}</span>
				<button
					type="button"
					disabled={page * 10 >= total || busy || list.loading}
					onClick={() => setPage((n) => n + 1)}
				>
					{text.next}
				</button>
			</div>
			{message && <p role="status">{message}</p>}
		</section>
	);
}
