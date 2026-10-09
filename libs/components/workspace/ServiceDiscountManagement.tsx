import { FormEvent, useEffect, useRef, useState } from 'react';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { MemberType } from '../member/enums/member.enum';
import { ADMIN_DISCOUNT_SERVICES, SET_SERVICE_DISCOUNT } from '@/apollo/promotion/operations';
import { useClinicSettings } from '@/libs/payments/useClinicSettings';
import { formatMoney } from '../common/currency';
import { servicePriceForDisplay } from '../service/service-price';
import { usePromotionText } from './usePromotionText';
type Row = {
	_id: string;
	serviceTitle: string;
	serviceName: string;
	servicePrice: number;
	serviceDiscountPercent?: number;
	serviceStatus: string;
};
export default function ServiceDiscountManagement() {
	const text = usePromotionText();
	const clinic = useClinicSettings();
	const session = useReactiveVar(userVar);
	const allowed = Boolean(session._id && session.memberType === MemberType.ADMIN);
	const [page, setPage] = useState(1);
	const [selected, setSelected] = useState<Row | null>(null);
	const [percent, setPercent] = useState('0');
	const [message, setMessage] = useState('');
	const lock = useRef(false);
	const [load, catalog] = useMutation<{
		getAllServicesByAdmin: { list: Row[]; metaCounter: Array<{ total: number }> };
	}>(ADMIN_DISCOUNT_SERVICES);
	const [save, saving] = useMutation(SET_SERVICE_DISCOUNT);
	const refresh = () => load({ variables: { input: { page, limit: 10, search: {} } } });
	useEffect(() => {
		if (allowed) void load({ variables: { input: { page, limit: 10, search: {} } } }).catch(() => undefined);
	}, [allowed, page, load]);
	const submit = async (event: FormEvent) => {
		event.preventDefault();
		if (!allowed || !selected || lock.current) return;
		lock.current = true;
		setMessage('');
		try {
			await save({ variables: { input: { serviceId: selected._id, discountPercent: Number(percent) } } });
			await refresh();
			setSelected(null);
			setMessage(text.saved);
		} catch (error) {
			setMessage(error instanceof Error ? error.message : 'Error');
		} finally {
			lock.current = false;
		}
	};
	const rows = catalog.data?.getAllServicesByAdmin.list ?? [];
	const total = catalog.data?.getAllServicesByAdmin.metaCounter[0]?.total ?? 0;
	return (
		<section className="clinical-staff-panel clinical-admin-resource clinical-resource-panel">
			<header>
				<h2>{text.discounts}</h2>
				<button
					type="button"
					disabled={catalog.loading || saving.loading}
					onClick={() => void refresh().catch(() => undefined)}
				>
					{text.retry}
				</button>
			</header>
			<p>{text.serviceHelp}</p>
			{catalog.error && <p role="alert">{catalog.error.message}</p>}
			<div className="clinical-resource-actions">
				{rows
					.filter((row) => row.serviceStatus !== 'DELETED')
					.map((row) => (
						<button
							type="button"
							key={row._id}
							disabled={saving.loading}
							onClick={() => {
								setSelected(row);
								setPercent(String(row.serviceDiscountPercent ?? 0));
								setMessage('');
							}}
						>
							{row.serviceTitle || row.serviceName} ·{' '}
							{formatMoney(servicePriceForDisplay(row, clinic.currency), clinic.currency)} ·{' '}
							{row.serviceDiscountPercent ?? 0}%
						</button>
					))}
			</div>
			{selected && (
				<form className="clinical-resource-form" onSubmit={submit}>
					<h3>{selected.serviceTitle || selected.serviceName}</h3>
					<p>
						{text.base}: {formatMoney(selected.servicePrice, clinic.currency)}
					</p>
					<fieldset className="clinical-resource-fields" disabled={saving.loading}>
						<label>
							{text.percent}
							<input
								type="number"
								min={0}
								max={100}
								step="0.01"
								required
								value={percent}
								onChange={(e) => setPercent(e.target.value)}
							/>
						</label>
					</fieldset>
					<div className="clinical-resource-actions">
						<button type="submit" disabled={saving.loading}>
							{text.save}
						</button>
						<button type="button" disabled={saving.loading} onClick={() => setSelected(null)}>
							{text.cancel}
						</button>
					</div>
				</form>
			)}
			<div className="clinical-resource-actions">
				<button
					type="button"
					disabled={page <= 1 || catalog.loading || saving.loading}
					onClick={() => setPage((n) => n - 1)}
				>
					{text.previous}
				</button>
				<span>{page}</span>
				<button
					type="button"
					disabled={page * 10 >= total || catalog.loading || saving.loading}
					onClick={() => setPage((n) => n + 1)}
				>
					{text.next}
				</button>
			</div>
			{message && <p role="status">{message}</p>}
		</section>
	);
}
