import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { MemberType } from '../member/enums/member.enum';
import {
	GET_PROMO_CODES,
	CREATE_PROMO_CODE,
	UPDATE_PROMO_CODE,
	REMOVE_PROMO_CODE,
	ADMIN_DISCOUNT_SERVICES,
} from '@/apollo/promotion/operations';
import { usePromotionText } from './usePromotionText';
import { useClinicSettings } from '@/libs/payments/useClinicSettings';
import { formatMoney } from '../common/currency';
import { usePreferences } from '../preference/PreferenceProvider';
import Icon from '../common/Icon';
import { DiscountService } from './ServiceDiscountManagement';
import styles from '../promotions/Promotions.module.scss';
export type Promo = {
	_id: string;
	code: string;
	discountType: 'PERCENT' | 'FIXED';
	discountValue: number;
	currency: string;
	isActive: boolean;
	showOnHomepage?: boolean;
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
	showOnHomepage: false,
	minSubtotal: '0',
	startsAt: '',
	expiresAt: '',
	serviceIds: [] as string[],
};
const localTime = (value?: string) => {
	if (!value) return '';
	const d = new Date(value);
	return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
		.toISOString()
		.slice(0, 16);
};
export function promoAvailability(
	promo: Pick<Promo, 'isActive' | 'startsAt' | 'expiresAt'>,
	now = Date.now(),
) {
	if (!promo.isActive) return 'inactive';
	if (promo.expiresAt && new Date(promo.expiresAt).getTime() <= now)
		return 'expired';
	if (promo.startsAt && new Date(promo.startsAt).getTime() > now)
		return 'scheduled';
	return 'active';
}
export default function PromoCodeManagement() {
	const text = usePromotionText(),
		clinic = useClinicSettings(),
		session = useReactiveVar(userVar),
		{ language } = usePreferences();
	const allowed = Boolean(
			session._id && session.memberType === MemberType.ADMIN,
		),
		account = `ADMIN:${session._id}`;
	const [page, setPage] = useState(1),
		[editing, setEditing] = useState<Promo | null | undefined>(undefined),
		[draft, setDraft] = useState(blank),
		[feedback, setFeedback] = useState({ text: '', error: false });
	const [scopeQuery, setScopeQuery] = useState(''),
		[scopeDraft, setScopeDraft] = useState(''),
		[scopePage, setScopePage] = useState(1),
		[scoped, setScoped] = useState(false);
	const lock = useRef(false),
		codeInput = useRef<HTMLInputElement>(null),
		scopeNames = useRef(new Map<string, string>()),
		newButton = useRef<HTMLButtonElement>(null);
	const list = useQuery<{
		getPromoCodesByAdmin: {
			list: Promo[];
			metaCounter: Array<{ total: number }>;
		};
	}>(GET_PROMO_CODES, {
		variables: { input: { page, limit: 10 } },
		skip: !allowed,
		fetchPolicy: 'network-only',
		notifyOnNetworkStatusChange: true,
	});
	const [loadServices, catalog] = useMutation<{
		getAllServicesByAdmin: {
			list: DiscountService[];
			metaCounter: Array<{ total: number }>;
		};
	}>(ADMIN_DISCOUNT_SERVICES);
	const [create, creating] = useMutation(CREATE_PROMO_CODE),
		[update, updating] = useMutation(UPDATE_PROMO_CODE),
		[remove, removing] = useMutation(REMOVE_PROMO_CODE);
	const busy = creating.loading || updating.loading || removing.loading;
	const currency = editing?.currency ?? clinic.currency;
	const locale =
		language === 'KR' ? 'ko-KR' : language === 'UZ' ? 'uz-UZ' : 'en-US';
	const date = (value?: string) =>
		value
			? new Intl.DateTimeFormat(locale, {
					dateStyle: 'medium',
					timeStyle: 'short',
				}).format(new Date(value))
			: text.noExpiry;
	useEffect(() => {
		if (editing !== undefined) codeInput.current?.focus();
	}, [editing]);
	const loadScope = useCallback(
		() =>
			loadServices({
				variables: {
					input: {
						page: scopePage,
						limit: 20,
						sort: 'createdAt',
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
							...(scopeQuery ? { text: scopeQuery } : {}),
						},
					},
				},
				context: { expectedAccount: account },
			}),
		[loadServices, scopePage, scopeQuery, account],
	);
	const composerOpen = editing !== undefined;
	useEffect(() => {
		if (allowed && composerOpen && scoped)
			void loadScope()
				.then(({ data }) => {
					data?.getAllServicesByAdmin.list.forEach((service) =>
						scopeNames.current.set(
							service._id,
							service.serviceTitle || service.serviceName,
						),
					);
				})
				.catch(() => undefined);
	}, [allowed, composerOpen, scoped, loadScope]);
	const open = (promo: Promo | null) => {
		setEditing(promo);
		setDraft(
			promo
				? {
						code: promo.code,
						discountType: promo.discountType,
						discountValue: String(promo.discountValue),
						isActive: promo.isActive,
						showOnHomepage: Boolean(promo.showOnHomepage),
						minSubtotal: String(promo.minSubtotal),
						startsAt: localTime(promo.startsAt),
						expiresAt: localTime(promo.expiresAt),
						serviceIds: promo.serviceIds,
					}
				: blank,
		);
		setScoped(Boolean(promo?.serviceIds.length));
		setScopeQuery('');
		setScopeDraft('');
		setScopePage(1);
		setFeedback({ text: '', error: false });
	};
	const close = () => {
		setEditing(undefined);
		newButton.current?.focus();
	};
	const save = async (event: FormEvent) => {
		event.preventDefault();
		if (!allowed || lock.current || editing === undefined) return;
		if (
			draft.startsAt &&
			draft.expiresAt &&
			new Date(draft.expiresAt) <= new Date(draft.startsAt)
		) {
			setFeedback({ text: text.invalidDates, error: true });
			return;
		}
		if (scoped && !draft.serviceIds.length) {
			setFeedback({ text: text.chooseRequired, error: true });
			return;
		}
		lock.current = true;
		setFeedback({ text: '', error: false });
		try {
			const input = {
				...draft,
				serviceIds: scoped ? draft.serviceIds : [],
				code: draft.code.trim().toUpperCase(),
				discountValue: Number(draft.discountValue),
				minSubtotal: Number(draft.minSubtotal),
				startsAt: draft.startsAt
					? new Date(draft.startsAt).toISOString()
					: null,
				expiresAt: draft.expiresAt
					? new Date(draft.expiresAt).toISOString()
					: null,
			};
			await (editing
				? update({
						variables: { input: { ...input, _id: editing._id } },
						context: { expectedAccount: account },
					})
				: create({
						variables: { input },
						context: { expectedAccount: account },
					}));
			close();
			await list.refetch();
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
	const archive = async (promo: Promo) => {
		if (!allowed || lock.current || !window.confirm(text.confirmArchive))
			return;
		lock.current = true;
		setFeedback({ text: '', error: false });
		try {
			await remove({
				variables: { promoCodeId: promo._id },
				context: { expectedAccount: account },
			});
			if (editing?._id === promo._id) close();
			await list.refetch();
			setFeedback({ text: text.archived, error: false });
		} catch (error) {
			setFeedback({
				text: error instanceof Error ? error.message : text.retryLoad,
				error: true,
			});
		} finally {
			lock.current = false;
		}
	};
	const total = list.data?.getPromoCodesByAdmin.metaCounter[0]?.total ?? 0,
		rows = list.data?.getPromoCodesByAdmin.list ?? [],
		services = catalog.data?.getAllServicesByAdmin.list ?? [],
		scopeTotal = catalog.data?.getAllServicesByAdmin.metaCounter[0]?.total ?? 0;
	const toggleService = (id: string) =>
		setDraft((current) => ({
			...current,
			serviceIds: current.serviceIds.includes(id)
				? current.serviceIds.filter((value) => value !== id)
				: [...current.serviceIds, id],
		}));
	const amount =
		draft.discountType === 'PERCENT'
			? `${draft.discountValue || '0'}%`
			: formatMoney(Number(draft.discountValue) || 0, currency);
	return (
		<section className={styles.adminPanel}>
			<div className={styles.panelHeading}>
				<div>
					<h2>{text.promotions}</h2>
					<p>{text.help}</p>
				</div>
				<button
					ref={newButton}
					type="button"
					className={styles.primary}
					disabled={busy}
					onClick={() => open(null)}
				>
					<Icon name="add" />
					{text.create}
				</button>
			</div>
			{editing !== undefined && (
				<form className={styles.promoComposer} onSubmit={save}>
					<div className={styles.composerFields}>
						<div className={styles.composerHeading}>
							<h3>{editing ? text.edit : text.create}</h3>
							<button
								className={styles.iconButton}
								aria-label={text.cancel}
								type="button"
								disabled={busy}
								onClick={close}
							>
								<Icon name="close" />
							</button>
						</div>
						<fieldset disabled={busy} className={styles.formSection}>
							<legend>{text.settings}</legend>
							<div className={styles.formGrid}>
								<label className={styles.wide}>
									{text.code}
									<input
										ref={codeInput}
										className={styles.codeInput}
										required
										minLength={3}
										maxLength={32}
										pattern="[A-Za-z0-9_-]+"
										autoComplete="off"
										value={draft.code}
										onChange={(event) =>
											setDraft((current) => ({
												...current,
												code: event.target.value.toUpperCase(),
											}))
										}
									/>
									<small>{text.codeHelp}</small>
								</label>
								<label>
									{text.discount}
									<select
										value={draft.discountType}
										onChange={(event) =>
											setDraft((current) => ({
												...current,
												discountType: event.target
													.value as Promo['discountType'],
											}))
										}
									>
										<option value="PERCENT">{text.percent}</option>
										<option value="FIXED">
											{text.fixed} ({currency})
										</option>
									</select>
								</label>
								<label>
									{text.value} ·{' '}
									{draft.discountType === 'PERCENT' ? '%' : currency}
									<input
										type="number"
										required
										min="0.01"
										max={draft.discountType === 'PERCENT' ? 100 : 1e9}
										step="0.01"
										value={draft.discountValue}
										onChange={(event) =>
											setDraft((current) => ({
												...current,
												discountValue: event.target.value,
											}))
										}
									/>
								</label>
								<label className={styles.wide}>
									{text.minimum} · {currency}
									<input
										type="number"
										required
										min={0}
										max={1e9}
										step="0.01"
										value={draft.minSubtotal}
										onChange={(event) =>
											setDraft((current) => ({
												...current,
												minSubtotal: event.target.value,
											}))
										}
									/>
								</label>
							</div>
						</fieldset>
						<fieldset disabled={busy} className={styles.formSection}>
							<legend>{text.schedule}</legend>
							<div className={styles.formGrid}>
								<label>
									{text.starts}
									<input
										type="datetime-local"
										value={draft.startsAt}
										onChange={(event) =>
											setDraft((current) => ({
												...current,
												startsAt: event.target.value,
											}))
										}
									/>
								</label>
								<label>
									{text.expires}
									<input
										type="datetime-local"
										min={draft.startsAt || undefined}
										value={draft.expiresAt}
										onChange={(event) =>
											setDraft((current) => ({
												...current,
												expiresAt: event.target.value,
											}))
										}
									/>
								</label>
							</div>
							<p className={styles.help}>{text.dateHelp}</p>
							<label className={styles.check}>
								<input
									type="checkbox"
									checked={draft.isActive}
									onChange={(event) =>
										setDraft((current) => ({
											...current,
											isActive: event.target.checked,
										}))
									}
								/>
								{text.active}
							</label>
						</fieldset>
						<fieldset disabled={busy} className={styles.formSection}>
							<legend>{text.homeVisibility}</legend>
							<label className={styles.check}>
								<input type="checkbox" checked={draft.showOnHomepage}
									onChange={(event) => setDraft((current) => ({ ...current, showOnHomepage: event.target.checked }))} />
								<span>{text.showOnHomepage}</span>
							</label>
							<p className={styles.help}>{text.homeVisibilityHelp}</p>
						</fieldset>
						<fieldset disabled={busy} className={styles.formSection}>
							<legend>{text.eligibility}</legend>
							<div className={styles.scopeChoices}>
								<label className={styles.check}>
									<input
										type="radio"
										name="promo-scope"
										checked={!scoped}
										onChange={() => setScoped(false)}
									/>
									{text.allScope}
								</label>
								<label className={styles.check}>
									<input
										type="radio"
										name="promo-scope"
										checked={scoped}
										onChange={() => setScoped(true)}
									/>
									{text.selectedScope}
								</label>
							</div>
							{scoped && (
								<div className={styles.scopePicker}>
									<div className={styles.inlineSearch}>
										<Icon name="search" />
										<input
											type="search"
											value={scopeDraft}
											maxLength={100}
											placeholder={text.scopeSearch}
											aria-label={text.scopeSearch}
											onChange={(event) => setScopeDraft(event.target.value)}
											onKeyDown={(event) => {
												if (event.key === 'Enter') {
													event.preventDefault();
													setScopeQuery(scopeDraft.trim());
													setScopePage(1);
												}
											}}
										/>
										<button
											type="button"
											className={styles.iconButton}
											aria-label={text.scopeSearch}
											onClick={() => {
												setScopeQuery(scopeDraft.trim());
												setScopePage(1);
											}}
										>
											<Icon name="arrow_forward" />
										</button>
									</div>
									<p className={styles.help}>
										{text.selected}: {draft.serviceIds.length} / 100
									</p>
									{draft.serviceIds.length > 0 && (
										<div className={styles.chips}>
											{draft.serviceIds.map((id) => (
												<button
													type="button"
													key={id}
													onClick={() => toggleService(id)}
													aria-label={`${text.remove}: ${scopeNames.current.get(id) || text.services}`}
												>
													{scopeNames.current.get(id) ||
														`${text.services} …${id.slice(-6)}`}
													<Icon name="close" />
												</button>
											))}
										</div>
									)}
									{catalog.error ? (
										<p role="alert" className={styles.error}>
											{catalog.error.message}
											<button
												className={styles.textButton}
												type="button"
												onClick={() => void loadScope().catch(() => undefined)}
											>
												{text.retryLoad}
											</button>
										</p>
									) : (
										<div
											className={styles.scopeList}
											aria-busy={catalog.loading}
										>
											{services.map((service) => (
												<label key={service._id} className={styles.check}>
													<input
														type="checkbox"
														checked={draft.serviceIds.includes(service._id)}
														disabled={
															!draft.serviceIds.includes(service._id) &&
															draft.serviceIds.length >= 100
														}
														onChange={() => toggleService(service._id)}
													/>
													<span>
														{service.serviceTitle || service.serviceName}
														<small>{service.serviceStatus}</small>
													</span>
												</label>
											))}
										</div>
									)}
									{catalog.loading && <p role="status">{text.loading}</p>}
									{!catalog.loading && !catalog.error && !services.length && (
										<p>{text.noServices}</p>
									)}
									<div className={styles.pagination}>
										<span>
											{scopeTotal} {text.serviceCount}
										</span>
										<div>
											<button
												type="button"
												aria-label={text.previous}
												disabled={scopePage <= 1 || catalog.loading}
												onClick={() => setScopePage((n) => n - 1)}
											>
												<Icon name="chevron_left" />
											</button>
											<span>{scopePage}</span>
											<button
												type="button"
												aria-label={text.next}
												disabled={
													scopePage * 20 >= scopeTotal || catalog.loading
												}
												onClick={() => setScopePage((n) => n + 1)}
											>
												<Icon name="chevron_right" />
											</button>
										</div>
									</div>
								</div>
							)}
						</fieldset>
						<div className={styles.actions}>
							<button
								className={styles.primary}
								type="submit"
								disabled={busy || (scoped && !draft.serviceIds.length)}
							>
								{busy ? text.saving : text.save}
							</button>
							<button
								className={styles.secondary}
								type="button"
								disabled={busy}
								onClick={close}
							>
								{text.cancel}
							</button>
						</div>
					</div>
					<aside className={styles.promoPreview}>
						<span>{text.summary}</span>
						<div className={styles.coupon}>
							<Icon name="local_offer" />
							<strong>{amount}</strong>
							<span>{text.discount}</span>
							<code>{draft.code || '••••••'}</code>
						</div>
						<dl className={styles.priceSummary}>
							<div>
								<dt>{text.minimum}</dt>
								<dd>{formatMoney(Number(draft.minSubtotal) || 0, currency)}</dd>
							</div>
							<div>
								<dt>{text.services}</dt>
								<dd>
									{scoped
										? `${draft.serviceIds.length} ${text.selected}`
										: text.allScope}
								</dd>
							</div>
							<div>
								<dt>{text.starts}</dt>
								<dd>
									{draft.startsAt
										? date(new Date(draft.startsAt).toISOString())
										: text.anytime}
								</dd>
							</div>
							<div>
								<dt>{text.expires}</dt>
								<dd>
									{draft.expiresAt
										? date(new Date(draft.expiresAt).toISOString())
										: text.noExpiry}
								</dd>
							</div>
						</dl>
						<p className={styles.help}>{text.checkoutHelp}</p>
					</aside>
				</form>
			)}
			{feedback.text && (
				<p
					role={feedback.error ? 'alert' : 'status'}
					className={feedback.error ? styles.error : styles.success}
				>
					{feedback.text}
				</p>
			)}
			<div className={styles.listHeading}>
				<strong>
					{total} {text.totalCodes}
				</strong>
				<button
					type="button"
					className={styles.textButton}
					disabled={busy || list.loading}
					onClick={() => void list.refetch().catch(() => undefined)}
				>
					<Icon name="refresh" />
					{text.retry}
				</button>
			</div>
			{list.error ? (
				<div className={styles.empty} role="alert">
					<p>{list.error.message}</p>
					<button
						className={styles.secondary}
						type="button"
						onClick={() => void list.refetch().catch(() => undefined)}
					>
						{text.retryLoad}
					</button>
				</div>
			) : (
				<div className={styles.tableWrap} aria-busy={list.loading}>
					<table className={styles.table}>
						<thead>
							<tr>
								<th>{text.code}</th>
								<th>{text.discount}</th>
								<th>{text.services}</th>
								<th>{text.expires}</th>
								<th>
									<span className={styles.srOnly}>{text.edit}</span>
								</th>
							</tr>
						</thead>
						<tbody>
							{rows.map((promo) => {
								const status = promoAvailability(promo);
								return (
									<tr key={promo._id}>
										<td>
											<code className={styles.promoCode}>{promo.code}</code>
											{promo.showOnHomepage && <small>{text.showOnHomepage}</small>}
											<small>
												<span
													className={
														status === 'active'
															? styles.badge
															: styles.mutedBadge
													}
												>
													{text[status]}
												</span>
											</small>
										</td>
										<td>
											<strong>
												{promo.discountType === 'PERCENT'
													? `${promo.discountValue}%`
													: formatMoney(promo.discountValue, promo.currency)}
											</strong>
											<small>
												{text.minimum}:{' '}
												{formatMoney(promo.minSubtotal, promo.currency)}
											</small>
										</td>
										<td>
											{promo.serviceIds.length
												? `${promo.serviceIds.length} ${text.selected}`
												: text.allScope}
										</td>
										<td>
											{date(promo.expiresAt)}
											{promo.startsAt && (
												<small>
													{text.starts}: {date(promo.startsAt)}
												</small>
											)}
										</td>
										<td>
											<div className={styles.rowActions}>
												<button
													className={styles.iconButton}
													aria-label={`${text.edit}: ${promo.code}`}
													type="button"
													disabled={busy}
													onClick={() => open(promo)}
												>
													<Icon name="edit" />
												</button>
												<button
													className={styles.iconButton}
													aria-label={`${text.archive}: ${promo.code}`}
													type="button"
													disabled={busy}
													onClick={() => void archive(promo)}
												>
													<Icon name="archive" />
												</button>
											</div>
										</td>
									</tr>
								);
							})}
						</tbody>
					</table>
				</div>
			)}
			{list.loading && (
				<p role="status" className={styles.help}>
					{text.loading}
				</p>
			)}
			{!list.loading && !list.error && !rows.length && (
				<div className={styles.empty}>
					<Icon name="local_offer" />
					<h3>{text.empty}</h3>
					<p>{text.checkoutHelp}</p>
					<button
						className={styles.secondary}
						type="button"
						onClick={() => open(null)}
					>
						{text.create}
					</button>
				</div>
			)}
			<div className={styles.pagination}>
				<span>
					{page} / {Math.max(1, Math.ceil(total / 10))}
				</span>
				<div>
					<button
						type="button"
						aria-label={text.previous}
						disabled={page <= 1 || busy || list.loading}
						onClick={() => setPage((n) => n - 1)}
					>
						<Icon name="chevron_left" />
					</button>
					<button
						type="button"
						aria-label={text.next}
						disabled={page * 10 >= total || busy || list.loading}
						onClick={() => setPage((n) => n + 1)}
					>
						<Icon name="chevron_right" />
					</button>
				</div>
			</div>
		</section>
	);
}
