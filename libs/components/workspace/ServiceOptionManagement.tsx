import { servicePriceForDisplay } from '../service/service-price';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useApolloClient, useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import {
	ADMIN_OPTION_SERVICES,
	CREATE_SERVICE_OPTION,
	UPDATE_SERVICE_OPTION,
} from '@/apollo/service/options';
import { Service } from '../service/types/service';
import { getBookingOptions } from '../service/bookingOptions';
import ServiceBookingOptions from '../service/ServiceBookingOptions';
import { MemberType, MemberStatus } from '../member/enums/member.enum';
import { ServiceStatus } from '../service/enums/service.enum';
import { useClinicSettings } from '@/libs/payments/useClinicSettings';
import { formatMoney } from '../common/currency';
import Icon from '../common/Icon';
import { useServiceOptionText } from './useServiceOptionText';
import styles from '../promotions/Promotions.module.scss';
import layout from './ServiceOptionManagement.module.scss';
import { useServiceTypeLabel } from '@/libs/i18n/useServiceTypeLabel';
import { getOptionScope, isValidOptionDraft } from './serviceOptionRules';
type OptionService = Omit<Service, 'memberData'> & {
	memberData?: {
		_id: string;
		memberStatus?: MemberStatus;
		docFullName?: string;
		docNick?: string;
	};
};
type Result = {
	getAllServicesByAdmin: {
		list: OptionService[];
		metaCounter: { total: number }[];
	};
};
const statuses = [
	'ACTIVE',
	'INACTIVE',
	'UNAVAILABLE',
	'RESERVED',
	'STARTED',
	'ENDED',
];
export default function ServiceOptionManagement() {
	const typeLabel = useServiceTypeLabel();
	const text = useServiceOptionText(),
		clinic = useClinicSettings(),
		account = useReactiveVar(userVar),
		client = useApolloClient();
	const allowed = Boolean(
			account._id && account.memberType === MemberType.ADMIN,
		),
		context = { expectedAccount: `ADMIN:${account._id}` };
	const [page, setPage] = useState(1),
		[search, setSearch] = useState(''),
		[query, setQuery] = useState(''),
		[base, setBase] = useState<OptionService | null>(null);
	const [editing, setEditing] = useState<OptionService | null | undefined>(
			undefined,
		),
		[selected, setSelected] = useState(''),
		[feedback, setFeedback] = useState({ text: '', error: false });
	const [draft, setDraft] = useState({
		serviceTitle: '',
		servicePrice: '',
		serviceDuration: '',
		serviceDesc: '',
		serviceStatus: 'INACTIVE',
		includedServiceIds: [] as string[],
	});
	const [saving, setSaving] = useState(false);
	const lock = useRef(false),
		titleInput = useRef<HTMLInputElement>(null);
	const [load, catalog] = useMutation<Result>(ADMIN_OPTION_SERVICES),
		[loadFamily, family] = useMutation<Result>(ADMIN_OPTION_SERVICES);
	const [create, creating] = useMutation(CREATE_SERVICE_OPTION),
		[update, updating] = useMutation(UPDATE_SERVICE_OPTION);
	const busy = saving || creating.loading || updating.loading;
	const loadCatalog = useCallback(
		() =>
			load({
				variables: {
					input: {
						page,
						limit: 10,
						sort: 'updatedAt',
						direction: 'DESC',
						search: {
							serviceStatusList: statuses,
							...(query ? { text: query } : {}),
						},
					},
				},
				context: { expectedAccount: `ADMIN:${account._id}` },
			}),
		[load, page, query, account._id],
	);
	const baseId = base?._id,
		baseDoctor = base?.memberId,
		baseType = base?.serviceType;
	const refreshFamily = useCallback(
		() =>
			loadFamily({
				variables: {
					input: {
						page: 1,
						limit: 100,
						sort: 'createdAt',
						direction: 'ASC',
						search: {
							memberId: baseDoctor,
							serviceStatusList: statuses,
						},
					},
				},
				context: { expectedAccount: `ADMIN:${account._id}` },
			}),
		[loadFamily, baseDoctor, baseType, account._id],
	);
	useEffect(() => {
		if (allowed) void loadCatalog().catch(() => undefined);
	}, [allowed, loadCatalog]);
	useEffect(() => {
		if (allowed && baseId) void refreshFamily().catch(() => undefined);
	}, [allowed, baseId, refreshFamily]);
	useEffect(() => {
		if (editing !== undefined) titleInput.current?.focus();
	}, [editing]);
	const rows = catalog.data?.getAllServicesByAdmin.list ?? [],
		total = catalog.data?.getAllServicesByAdmin.metaCounter[0]?.total ?? 0;
	const {
		base: currentBase,
		variants,
		capacity,
	} = getOptionScope(base, family.data?.getAllServicesByAdmin.list ?? []);
	const doctorActive =
		currentBase?.memberData?.memberStatus === MemberStatus.ACTIVE;
	const activeBase =
		variants.find(
			(row) =>
				row._id === base?._id && row.serviceStatus === ServiceStatus.ACTIVE,
		) ?? variants.find((row) => row.serviceStatus === ServiceStatus.ACTIVE);
	const extras = (family.data?.getAllServicesByAdmin.list ?? []).filter(
		(row) =>
			row._id !== currentBase?._id &&
			!row.packageBaseServiceId &&
			row.serviceStatus === ServiceStatus.ACTIVE &&
			row.serviceRoom === currentBase?.serviceRoom,
	);
	const regular =
		(currentBase ? servicePriceForDisplay(currentBase, clinic.currency) : 0) +
		extras
			.filter((row) => draft.includedServiceIds.includes(row._id))
			.reduce(
				(sum, row) => sum + servicePriceForDisplay(row, clinic.currency),
				0,
			);
	const options = activeBase ? getBookingOptions(activeBase, variants) : [],
		chosen = options.find((row) => row._id === selected) ?? options[0];
	const open = (row: OptionService | null) => {
		if (!currentBase || busy || (!row && (!doctorActive || capacity >= 4)))
			return;
		setEditing(row);
		setDraft({
			serviceTitle: row?.serviceTitle ?? '',
			servicePrice: String(row?.servicePrice ?? currentBase.servicePrice),
			serviceDuration:
				row?.serviceDuration ?? currentBase.serviceDuration ?? '30',
			serviceDesc: row?.serviceDesc ?? currentBase.serviceDesc ?? '',
			serviceStatus: row?.serviceStatus ?? 'INACTIVE',
			includedServiceIds:
				row?.packageItems?.slice(1).map((item) => item.serviceId) ?? [],
		});
		setFeedback({ text: '', error: false });
	};
	const save = async (event: FormEvent) => {
		event.preventDefault();
		if (!allowed || !base || editing === undefined || lock.current) return;
		if (
			!isValidOptionDraft(draft, clinic.currency) ||
			!draft.includedServiceIds.length ||
			draft.includedServiceIds.length > 3 ||
			Number(draft.servicePrice) >= regular ||
			Number(draft.serviceDuration) <
				Number(currentBase?.serviceDuration || 0) +
					extras
						.filter((row) => draft.includedServiceIds.includes(row._id))
						.reduce((sum, row) => sum + Number(row.serviceDuration || 0), 0)
		) {
			setFeedback({ text: text.invalid, error: true });
			return;
		}
		lock.current = true;
		setSaving(true);
		setFeedback({ text: '', error: false });
		try {
			const input = {
				includedServiceIds: draft.includedServiceIds,
				serviceTitle: draft.serviceTitle.trim(),
				servicePrice: Number(draft.servicePrice),
				serviceDuration: String(Number(draft.serviceDuration)),
				serviceDesc: draft.serviceDesc.trim(),
			};
			if (editing)
				await update({
					variables: {
						input: {
							...input,
							optionId: editing._id,
							baseServiceId: currentBase?._id,
							serviceStatus: draft.serviceStatus,
						},
					},
					context,
				});
			else
				await create({
					variables: { input: { ...input, baseServiceId: currentBase?._id } },
					context,
				});
			setEditing(undefined);
			client.cache.evict({ id: 'ROOT_QUERY', fieldName: 'getServices' });
			client.cache.evict({ id: 'ROOT_QUERY', fieldName: 'getService' });
			const results = await Promise.allSettled([
				refreshFamily(),
				loadCatalog(),
			]);
			setFeedback({
				text: results.some((result) => result.status === 'rejected')
					? text.savedRefresh
					: text.saved,
				error: false,
			});
		} catch (error) {
			setFeedback({
				text: error instanceof Error ? error.message : text.error,
				error: true,
			});
		} finally {
			lock.current = false;
			setSaving(false);
		}
	};
	return (
		<section className={styles.adminPanel}>
			<div className={styles.panelHeading}>
				<div>
					<h2>{text.title}</h2>
					<p>{text.intro}</p>
				</div>
				<Link className={styles.secondary} href="/admin/services?view=catalog">
					<Icon name="medical_services" />
					{text.catalog}
				</Link>
			</div>
			<div className={layout.workbench}>
				<aside className={layout.picker}>
					<h3>{text.choose}</h3>
					<form
						className={styles.inlineSearch}
						onSubmit={(event) => {
							event.preventDefault();
							setQuery(search.trim());
							setPage(1);
						}}
					>
						<Icon name="search" />
						<input
							aria-label={text.search}
							type="search"
							maxLength={100}
							value={search}
							onChange={(event) => setSearch(event.target.value)}
						/>
						<button
							className={styles.iconButton}
							type="submit"
							aria-label={text.search}
							disabled={busy}
						>
							<Icon name="arrow_forward" />
						</button>
					</form>
					{catalog.error && (
						<p className={styles.error} role="alert">
							{catalog.error.message}
							<button
								type="button"
								className={styles.textButton}
								onClick={() => void loadCatalog().catch(() => undefined)}
							>
								{text.retry}
							</button>
						</p>
					)}
					<div className={layout.services} aria-busy={catalog.loading}>
						{rows
							.filter((row) => !row.packageBaseServiceId)
							.map((row) => (
								<button
									type="button"
									key={row._id}
									aria-pressed={base?._id === row._id}
									disabled={
										busy ||
										editing !== undefined ||
										row._id === currentBase?._id
									}
									onClick={() => {
									setBase(row);
									setEditing(undefined);
									setSelected('');
									setFeedback({ text: '', error: false });
								}}
								>
									<strong>{row.serviceTitle || row.serviceName}</strong>
									<span>
										{row.memberData?.docFullName ||
										row.memberData?.docNick ||
										'—'}
									</span>
									<small>
										{formatMoney(row.servicePrice, clinic.currency)} ·{' '}
										{row.serviceStatus === ServiceStatus.ACTIVE
													? text.active
													: row.serviceStatus === ServiceStatus.INACTIVE
														? text.inactive
														: row.serviceStatus}
									</small>
								</button>
							))}
					</div>
					{catalog.loading && <p role="status">{text.loading}</p>}
					{!catalog.loading && !catalog.error && !rows.length && (
						<p>{text.empty}</p>
					)}
					<div className={styles.pagination}>
						<span>
							{page} / {Math.max(1, Math.ceil(total / 10))}
						</span>
						<div>
							<button
								type="button"
								aria-label={text.previous}
								disabled={page <= 1 || catalog.loading || busy}
								onClick={() => setPage((n) => n - 1)}
							>
								<Icon name="chevron_left" />
							</button>
							<button
								type="button"
								aria-label={text.next}
								disabled={page * 10 >= total || catalog.loading || busy}
								onClick={() => setPage((n) => n + 1)}
							>
								<Icon name="chevron_right" />
							</button>
						</div>
					</div>
				</aside>
				<div className={layout.details}>
					{base ? (
						<>
							<div className={styles.panelHeading}>
								<div>
									<h3>
										{currentBase?.serviceTitle || currentBase?.serviceName}
									</h3>
									<p>
										{base.memberData?.docFullName || base.memberData?.docNick} —{' '}
										{typeLabel(base.serviceType)}
									</p>
								</div>
								<button
									type="button"
									className={styles.primary}
									disabled={
										busy ||
										family.loading ||
										Boolean(family.error) ||
										capacity >= 4 ||
										!doctorActive ||
										editing !== undefined ||
										!variants.length
									}
									onClick={() => open(null)}
								>
									<Icon name="add" />
									{text.new}
								</button>
							</div>
							<div className={layout.context}>
								<p>{text.group}</p>
								<div>
									<strong>
										{family.loading ? '…' : family.error ? '—' : capacity} / 4
									</strong>
									<span>{text.capacity}</span>
								</div>
							</div>
							<p className={styles.help}>{text.limit}</p>
							{!doctorActive && (
								<p className={styles.help}>{text.doctorInactive}</p>
							)}
							{family.error && (
								<p className={styles.error} role="alert">
									{family.error.message}
									<button
										type="button"
										className={styles.textButton}
										onClick={() => void refreshFamily().catch(() => undefined)}
									>
										{text.retry}
									</button>
								</p>
							)}
							<div className={layout.variantList} aria-busy={family.loading}>
								{variants.map((row) => (
									<div key={row._id}>
										<div>
											<strong>{row.serviceTitle || row.serviceName}</strong>
											<small>
												{row.serviceDuration} {text.minutes} ·{' '}
												{row.serviceStatus === ServiceStatus.ACTIVE
													? text.active
													: row.serviceStatus === ServiceStatus.INACTIVE
														? text.inactive
														: row.serviceStatus}
											</small>
										</div>
										<b>{formatMoney(row.servicePrice, clinic.currency)}</b>
										<button
											type="button"
											className={styles.iconButton}
											aria-label={`${text.edit}: ${row.serviceTitle || row.serviceName}`}
											disabled={
												busy ||
												editing !== undefined ||
												row._id === currentBase?._id
											}
											onClick={() => open(row)}
										>
											<Icon name="edit" />
										</button>
									</div>
								))}
							</div>
							{family.loading && <p role="status">{text.loading}</p>}
							{editing !== undefined && (
								<form className={layout.composer} onSubmit={save}>
									<div className={styles.composerHeading}>
										<h3>{editing ? text.edit : text.new}</h3>
										<button
											type="button"
											className={styles.iconButton}
											aria-label={text.cancel}
											disabled={busy}
											onClick={() => setEditing(undefined)}
										>
											<Icon name="close" />
										</button>
									</div>
									<fieldset disabled={busy} className={layout.fields}>
										<fieldset className={layout.includes}>
											<legend>{text.includes}</legend>
											{extras
												.filter((row) => row._id !== editing?._id)
												.map((row) => (
													<label key={row._id}>
														<input
															type="checkbox"
															checked={draft.includedServiceIds.includes(
																row._id,
															)}
															onChange={(event) => {
																const ids = event.target.checked
																	? [...draft.includedServiceIds, row._id]
																	: draft.includedServiceIds.filter(
																			(id) => id !== row._id,
																		);
																const components = extras.filter((item) =>
																	ids.includes(item._id),
																);
																setDraft((current) => ({
																	...current,
																	includedServiceIds: ids,
																	serviceTitle: [
																		currentBase?.serviceTitle ||
																			currentBase?.serviceName,
																		...components.map(
																			(item) =>
																				item.serviceTitle || item.serviceName,
																		),
																	]
																		.join(' + ')
																		.slice(0, 150),
																	serviceDuration: String(
																		Number(currentBase?.serviceDuration || 0) +
																			components.reduce(
																				(sum, item) =>
																					sum +
																					Number(item.serviceDuration || 0),
																				0,
																			),
																	),
																}));
															}}
														/>
														<span>
															{row.serviceTitle || row.serviceName}
															<small>
																{formatMoney(row.servicePrice, clinic.currency)}{' '}
																· {row.serviceDuration} {text.minutes}
															</small>
														</span>
													</label>
												))}
											{!extras.length && <p>{text.noIncludes}</p>}
										</fieldset>
										<p>
											{text.separate}: {formatMoney(regular, clinic.currency)}.{' '}
											{text.packageHelp}
										</p>

										<label>
											{text.name}
											<input
												ref={titleInput}
												required
												minLength={2}
												maxLength={150}
												value={draft.serviceTitle}
												onChange={(event) =>
													setDraft((d) => ({
														...d,
														serviceTitle: event.target.value,
													}))
												}
											/>
										</label>
										<div className={styles.formGrid}>
											<label>
												{text.price} · {clinic.currency}
												<input
													required
													type="number"
													min={0}
													max={1e9}
													step={clinic.currency === 'KRW' ? '1' : '0.01'}
													value={draft.servicePrice}
													onChange={(event) =>
														setDraft((d) => ({
															...d,
															servicePrice: event.target.value,
														}))
													}
												/>
											</label>
											<label>
												{text.duration}
												<input
													required
													type="number"
													min={1}
													max={1440}
													step={1}
													value={draft.serviceDuration}
													onChange={(event) =>
														setDraft((d) => ({
															...d,
															serviceDuration: event.target.value,
														}))
													}
												/>
											</label>
										</div>
										<label>
											{text.description}
											<textarea
												required
												maxLength={2000}
												rows={3}
												value={draft.serviceDesc}
												onChange={(event) =>
													setDraft((d) => ({
														...d,
														serviceDesc: event.target.value,
													}))
												}
											/>
										</label>
										{editing ? (
											<label>
												{text.status}
												<select
													value={draft.serviceStatus}
													onChange={(event) =>
														setDraft((d) => ({
															...d,
															serviceStatus: event.target.value,
														}))
													}
												>
													<option value="ACTIVE">{text.active}</option>
													<option value="INACTIVE">{text.inactive}</option>
													{!['ACTIVE', 'INACTIVE'].includes(
														draft.serviceStatus,
													) && (
														<option value={draft.serviceStatus}>
															{draft.serviceStatus}
														</option>
													)}
												</select>
											</label>
										) : (
											<p className={styles.help}>{text.help}</p>
										)}
										<div className={styles.actions}>
											<button className={styles.primary} type="submit">
												{busy
													? text.saving
													: editing
														? text.save
														: text.saveDraft}
											</button>
											<button
												className={styles.secondary}
												type="button"
												onClick={() => setEditing(undefined)}
											>
												{text.cancel}
											</button>
										</div>
									</fieldset>
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
							<div className={layout.preview}>
								<h3>{text.preview}</h3>
								<p className={styles.help}>{text.previewHelp}</p>
								{chosen && activeBase ? (
									<ServiceBookingOptions
										options={options}
										selected={chosen}
										baseId={activeBase._id}
										currency={clinic.currency}
										loading={family.loading}
										failed={false}
										onChange={setSelected}
										onRetry={() => void refreshFamily().catch(() => undefined)}
										preview
									/>
								) : (
									!family.loading && <p>{text.notPublished}</p>
								)}
							</div>
						</>
					) : (
						<div className={styles.editorEmpty}>
							<Icon name="format_list_bulleted" />
							<h3>{text.none}</h3>
							<p>{text.group}</p>
						</div>
					)}
				</div>
			</div>
		</section>
	);
}
