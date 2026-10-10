import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useApolloClient, useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { MemberType } from '../member/enums/member.enum';
import {
	ADMIN_DISCOUNT_SERVICES,
	SET_SERVICE_DISCOUNT,
} from '@/apollo/promotion/operations';
import { useClinicSettings } from '@/libs/payments/useClinicSettings';
import { formatMoney } from '../common/currency';
import { servicePriceForDisplay } from '../service/service-price';
import { usePromotionText } from './usePromotionText';
import Icon from '../common/Icon';
import styles from '../promotions/Promotions.module.scss';
export type DiscountService = {
	_id: string;
	serviceTitle: string;
	serviceName: string;
	servicePrice: number;
	serviceDiscountPercent?: number;
	serviceStatus: string;
	serviceImages?: string[];
};
export default function ServiceDiscountManagement() {
	const text = usePromotionText(),
		clinic = useClinicSettings(),
		session = useReactiveVar(userVar),
		client = useApolloClient();
	const allowed = Boolean(
		session._id && session.memberType === MemberType.ADMIN,
	);
	const [page, setPage] = useState(1),
		[query, setQuery] = useState(''),
		[draftQuery, setDraftQuery] = useState('');
	const [selected, setSelected] = useState<DiscountService | null>(null),
		[percent, setPercent] = useState('0'),
		[feedback, setFeedback] = useState({ text: '', error: false });
	const lock = useRef(false),
		editor = useRef<HTMLInputElement>(null);
	const [load, catalog] = useMutation<{
		getAllServicesByAdmin: {
			list: DiscountService[];
			metaCounter: Array<{ total: number }>;
		};
	}>(ADMIN_DISCOUNT_SERVICES);
	const [save, saving] = useMutation(SET_SERVICE_DISCOUNT);
	const refresh = useCallback(
		() =>
			load({
				variables: {
					input: {
						page,
						limit: 10,
						sort: 'updatedAt',
						direction: 'DESC',
						search: {
							serviceStatusList: [
								'ACTIVE',
								'RESERVED',
								'STARTED',
								'ENDED',
								'INACTIVE',
								'UNAVAILABLE',
							],
							...(query ? { text: query } : {}),
						},
					},
				},
				context: { expectedAccount: `ADMIN:${session._id}` },
			}),
		[load, page, query, session._id],
	);
	useEffect(() => {
		if (allowed) void refresh().catch(() => undefined);
	}, [allowed, refresh]);
	const busy = saving.loading,
		value = Number(percent),
		valid =
			percent !== '' && Number.isFinite(value) && value >= 0 && value <= 100;
	const changed =
		selected && valid && value !== (selected.serviceDiscountPercent ?? 0);
	const newPrice =
		selected && valid
			? servicePriceForDisplay(
					{ ...selected, serviceDiscountPercent: value },
					clinic.currency,
				)
			: null;
	const submit = async (event: FormEvent) => {
		event.preventDefault();
		if (!allowed || !selected || !changed || lock.current) return;
		lock.current = true;
		setFeedback({ text: '', error: false });
		try {
			await save({
				variables: {
					input: { serviceId: selected._id, discountPercent: value },
				},
				context: { expectedAccount: `ADMIN:${session._id}` },
			});
			client.cache.evict({ id: 'ROOT_QUERY', fieldName: 'getServices' });
			await refresh();
			setSelected((current) =>
				current ? { ...current, serviceDiscountPercent: value } : null,
			);
			setFeedback({ text: text.saved, error: false });
		} catch (error) {
			setFeedback({
				text: error instanceof Error ? error.message : text.retryLoad,
				error: true,
			});
		} finally {
			lock.current = false;
		}
	};
	const select = (row: DiscountService) => {
		setSelected(row);
		setPercent(String(row.serviceDiscountPercent ?? 0));
		setFeedback({ text: '', error: false });
	};
	useEffect(() => {
		if (selected) editor.current?.focus();
	}, [selected?._id]);
	const rows = catalog.data?.getAllServicesByAdmin.list ?? [],
		total = catalog.data?.getAllServicesByAdmin.metaCounter[0]?.total ?? 0;
	return (
		<section className={styles.adminPanel}>
			<div className={styles.panelHeading}>
				<div>
					<h2>{text.discounts}</h2>
					<p>{text.serviceHelp}</p>
				</div>
				<button
					type="button"
					className={styles.secondary}
					disabled={catalog.loading || busy}
					onClick={() => void refresh().catch(() => undefined)}
				>
					<Icon name="refresh" />
					{text.retry}
				</button>
			</div>
			<form
				className={styles.toolbar}
				onSubmit={(event) => {
					event.preventDefault();
					setQuery(draftQuery.trim());
					setPage(1);
				}}
			>
				<label className={styles.inlineSearch}>
					<Icon name="search" />
					<input
						type="search"
						value={draftQuery}
						maxLength={100}
						onChange={(event) => setDraftQuery(event.target.value)}
						placeholder={text.searchServices}
						aria-label={text.searchServices}
					/>
				</label>
				<button className={styles.secondary} type="submit">
					<Icon name="search" />
					{text.searchServices}
				</button>
			</form>
			{catalog.error && (
				<p role="alert" className={styles.error}>
					{catalog.error.message}
				</p>
			)}
			<div className={styles.managementGrid}>
				<div>
					<div className={styles.tableWrap} aria-busy={catalog.loading}>
						<table className={styles.table}>
							<thead>
								<tr>
									<th>{text.catalog}</th>
									<th>{text.base}</th>
									<th>{text.discount}</th>
									<th>{text.payable}</th>
									<th>
										<span className={styles.srOnly}>{text.edit}</span>
									</th>
								</tr>
							</thead>
							<tbody>
								{rows.map((row) => (
									<tr key={row._id} data-selected={selected?._id === row._id}>
										<td>
											<strong>{row.serviceTitle || row.serviceName}</strong>
											<small>{row.serviceStatus}</small>
										</td>
										<td>{formatMoney(row.servicePrice, clinic.currency)}</td>
										<td>
											<span
												className={
													(row.serviceDiscountPercent ?? 0) > 0
														? styles.badge
														: styles.mutedBadge
												}
											>
												{row.serviceDiscountPercent ?? 0}%
											</span>
										</td>
										<td>
											<strong>
												{formatMoney(
													servicePriceForDisplay(row, clinic.currency),
													clinic.currency,
												)}
											</strong>
										</td>
										<td>
											<button
												type="button"
												className={styles.iconButton}
												aria-label={`${text.edit}: ${row.serviceTitle || row.serviceName}`}
												disabled={busy}
												onClick={() => select(row)}
											>
												<Icon name="edit" />
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					{!catalog.loading && !catalog.error && !rows.length && (
						<p className={styles.empty}>{text.noServices}</p>
					)}
					<div className={styles.pagination}>
						<span>
							{catalog.loading ? text.loading : `${total} ${text.serviceCount}`}
						</span>
						<div>
							<button
								type="button"
								disabled={page <= 1 || catalog.loading || busy}
								onClick={() => setPage((n) => n - 1)}
								aria-label={text.previous}
							>
								<Icon name="chevron_left" />
							</button>
							<span>{page}</span>
							<button
								type="button"
								disabled={page * 10 >= total || catalog.loading || busy}
								onClick={() => setPage((n) => n + 1)}
								aria-label={text.next}
							>
								<Icon name="chevron_right" />
							</button>
						</div>
					</div>
				</div>
				<aside className={styles.editor}>
					{selected ? (
						<form onSubmit={submit}>
							<div className={styles.editorHeading}>
								<Icon name="percent" />
								<h3>{text.preview}</h3>
							</div>
							<h4>{selected.serviceTitle || selected.serviceName}</h4>
							<dl className={styles.priceSummary}>
								<div>
									<dt>{text.base}</dt>
									<dd>{formatMoney(selected.servicePrice, clinic.currency)}</dd>
								</div>
								<div>
									<dt>{text.discount}</dt>
									<dd>{valid ? `${value}%` : '—'}</dd>
								</div>
							</dl>
							<label>
								{text.percent}
								<div className={styles.suffixInput}>
									<input
										ref={editor}
										type="number"
										min="0"
										max="100"
										step="0.01"
										required
										value={percent}
										onChange={(event) => {
											setPercent(event.target.value);
											setFeedback({ text: '', error: false });
										}}
										disabled={busy}
									/>
									<span>%</span>
								</div>
							</label>
							<div className={styles.presets} aria-label={text.quick}>
								{[0, 5, 10, 15, 20, 25].map((n) => (
									<button
										type="button"
										key={n}
										aria-pressed={value === n}
										disabled={busy}
										onClick={() => setPercent(String(n))}
									>
										{n}%
									</button>
								))}
							</div>
							<div className={styles.payable}>
								<span>{text.newPrice}</span>
								<strong>
									{newPrice === null
										? '—'
										: formatMoney(newPrice, clinic.currency)}
								</strong>
							</div>
							<p className={styles.help}>{text.discountNotice}</p>
							<div className={styles.actions}>
								<button
									type="submit"
									className={styles.primary}
									disabled={!changed || busy}
								>
									{busy ? text.saving : text.saveDiscount}
								</button>
								<button
									type="button"
									className={styles.textButton}
									disabled={busy}
									onClick={() => setSelected(null)}
								>
									{text.cancel}
								</button>
							</div>
							{feedback.text && (
								<p
									role={feedback.error ? 'alert' : 'status'}
									className={feedback.error ? styles.error : styles.success}
								>
									{feedback.text}
								</p>
							)}
						</form>
					) : (
						<div className={styles.editorEmpty}>
							<Icon name="price_change" />
							<h3>{text.chooseService}</h3>
							<p>{text.chooseHelp}</p>
						</div>
					)}
				</aside>
			</div>
		</section>
	);
}
