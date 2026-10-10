import { recordReference } from './recordPresentation';
import { useBookingSettlementLabel } from './useAppointmentFlowText';
import { appointmentStatusKeys } from '@/libs/components/dashboard/staffLabels';
import { AppointmentStatus } from '@/libs/components/dashboard/staffTypes';
import { useLiveWorkspaceRefresh } from '@/libs/hooks/useLiveWorkspaceRefresh';
import RecordThumbnail from '@/libs/components/common/RecordThumbnail';
import thumbnailStyles from '@/libs/components/common/RecordThumbnail.module.scss';
import ServiceDateCalendar from './ServiceDateCalendar';
import { clinicDateTime } from '@/libs/payments/clinic';
import { useClinicSettings } from '@/libs/payments/useClinicSettings';
import ImageUpload from './ImageUpload';
import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { DocumentNode } from 'graphql';
import { useApolloClient, useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import AdminPagination from '@/libs/components/dashboard/AdminPagination';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useWorkspaceText, WorkspaceTextKey } from './useWorkspaceText';
export type RecordItem = Record<string, any>;
export type ResourceField = {
	name: string;
	label: WorkspaceTextKey;
	type?:
		| 'calendar-dates'
		| 'text'
		| 'textarea'
		| 'number'
		| 'datetime-local'
		| 'date'
		| 'time'
		| 'email'
		| 'password'
		| 'url'
		| 'checkbox'
		| 'array';
	required?: boolean;
	min?: number;
	max?: number;
	maxLength?: number;
	minLength?: number;
	clearable?: boolean;
	editOnly?: boolean;
	step?: string;
	options?: (string | { value: string; label: string })[];
	readonly?: boolean;
	imageTarget?: string;
	defaultValue?: string | boolean | string[];
};
export type ResourceConfig = {
	live?: boolean;
	onRowsChange?: (rows: RecordItem[]) => void;
	role: MemberType;
	title: WorkspaceTextKey;
	list: DocumentNode;
	listKey: string;
	mutationList?: boolean;
	variables?: (page: number) => RecordItem;
	columns: ResourceField[];
	thumbnail?: { image: string; name: string; portrait?: boolean };
	fields?: ResourceField[];
	create?: DocumentNode;
	createDisabled?: boolean;
	createDisabledReason?: WorkspaceTextKey;
	update?: DocumentNode;
	createVariables?: (input: RecordItem) => RecordItem;
	updateVariables?: (input: RecordItem, record: RecordItem) => RecordItem;
	remove?: DocumentNode;
	removeVariables?: (record: RecordItem) => RecordItem;
	canEdit?: (record: RecordItem) => boolean;
	canRemove?: (record: RecordItem) => boolean;
	onSelect?: (record: RecordItem) => void;
	onSaved?: () => Promise<void>;
	arrayResult?: boolean;
	search?: boolean;
};
function localDateTime(value: string) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return '';
	return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
		.toISOString()
		.slice(0, 16);
}
export default function ResourcePanel({ config }: { config: ResourceConfig }) {
	const client = useApolloClient();
	const session = useReactiveVar(userVar);
	const t = useTranslation();
	const w = useWorkspaceText();
	const settlementLabel = useBookingSettlementLabel();
	const clinic = useClinicSettings();
	const [page, setPage] = useState(1);
	const [rows, setRows] = useState<RecordItem[]>([]);
	const [total, setTotal] = useState(0);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [feedback, setFeedback] = useState('');
	const [editor, setEditor] = useState<RecordItem | null | undefined>(
		undefined,
	);
	const [draft, setDraft] = useState<RecordItem>({});
	const [busy, setBusy] = useState(false);
	const [uploading, setUploading] = useState(false);
	const [search, setSearch] = useState('');
	const request = useRef(0);
	const pending = useRef(false);
	const formRef = useRef<HTMLFormElement>(null);
	const authorized = Boolean(session._id && session.memberType === config.role);
	const load = useCallback(
		async (background = false) => {
			if (!authorized) return;
			const generation = ++request.current;
			if (!background) setLoading(true);
			setError('');
			try {
				const variables = config.variables?.(page) ?? {
					input: { page, limit: 10 },
				};
				const response = config.mutationList
					? await client.mutate({ mutation: config.list, variables })
					: await client.query({
							query: config.list,
							variables,
							fetchPolicy: 'network-only',
						});
				if (generation !== request.current) return;
				const data = response.data?.[config.listKey];
				const nextRows = config.arrayResult ? (data ?? []) : (data?.list ?? []);
				setRows(nextRows);
				config.onRowsChange?.(nextRows);
				setTotal(
					config.arrayResult
						? (data?.length ?? 0)
						: (data?.metaCounter?.[0]?.total ?? 0),
				);
			} catch (e: any) {
				if (generation === request.current)
					setError(e.message ?? t('admin.loadError'));
			} finally {
				if (generation === request.current) setLoading(false);
			}
		},
		[authorized, session._id, session.memberType, client, config, page],
	);
	useEffect(() => {
		setRows([]);
		setTotal(0);
		setEditor(undefined);
		config.onRowsChange?.([]);
	}, [session._id, session.memberType]);
	useEffect(() => {
		void load();
		return () => {
			request.current++;
		};
	}, [load]);
	useEffect(() => {
		if (editor !== undefined)
			formRef.current
				?.querySelector<HTMLInputElement>(
					'input:not(:disabled),select:not(:disabled),textarea:not(:disabled)',
				)
				?.focus();
	}, [editor]);
	useLiveWorkspaceRefresh(
		() => load(true),
		authorized &&
			Boolean(config.live) &&
			!busy &&
			!loading &&
			editor === undefined,
	);
	const open = (record: RecordItem | null) => {
		setEditor(record);
		setDraft(
			Object.fromEntries(
				(config.fields ?? []).map((field) => [
					field.name,
					field.type === 'datetime-local' && record?.[field.name]
						? localDateTime(record[field.name])
						: (record?.[field.name] ?? field.defaultValue ?? ''),
				]),
			),
		);
		setFeedback('');
	};
	const save = async (event: FormEvent) => {
		event.preventDefault();
		if (pending.current || uploading) return;
		if (!editor && config.createDisabled) return;
		const operation = editor ? config.update : config.create;
		if (!operation) return;
		const input: RecordItem = {};
		for (const field of config.fields ?? []) {
			if (field.editOnly && !editor) continue;
			if (field.readonly && editor) continue;
			const value = draft[field.name];
			if (value === '' || value == null) {
				if (field.required) {
					setFeedback(`${w(field.label)}: ${w('choose')}`);
					return;
				}
				if (editor && field.clearable) input[field.name] = '';
				continue;
			}
			input[field.name] =
				field.type === 'number'
					? Number(value)
					: field.type === 'array'
						? String(value)
								.split(/\r?\n/)
								.map((x) => x.trim())
								.filter(Boolean)
						: field.type === 'datetime-local' || field.type === 'date'
							? new Date(value).toISOString()
							: value;
		}
		pending.current = true;
		setBusy(true);
		setFeedback('');
		try {
			const variables = editor
				? (config.updateVariables?.(input, editor) ?? {
						input: { ...input, _id: editor._id },
					})
				: (config.createVariables?.(input) ?? { input });
			await client.mutate({ mutation: operation, variables });
			setEditor(undefined);
			setFeedback(t('admin.saved'));
			await load();
			await config.onSaved?.();
		} catch (e: any) {
			setFeedback(e.message ?? t('admin.actionError'));
		} finally {
			pending.current = false;
			setBusy(false);
		}
	};
	const remove = async (record: RecordItem) => {
		if (
			pending.current ||
			!config.remove ||
			!window.confirm(w('confirmRemove'))
		)
			return;
		pending.current = true;
		setBusy(true);
		setFeedback('');
		try {
			await client.mutate({
				mutation: config.remove,
				variables: config.removeVariables?.(record) ?? {
					input: { _id: record._id },
				},
			});
			setFeedback(t('admin.saved'));
			await load();
			await config.onSaved?.();
		} catch (e: any) {
			setFeedback(e.message ?? t('admin.actionError'));
		} finally {
			pending.current = false;
			setBusy(false);
		}
	};
	const editorFields = (config.fields ?? []).filter(
		(field) => !field.editOnly || editor,
	);
	const filtered = search
		? rows.filter((row) =>
				config.columns.some((field) =>
					String(row[field.name] ?? '')
						.toLowerCase()
						.includes(search.toLowerCase()),
				),
			)
		: rows;
	return (
		<section className="clinical-staff-panel clinical-admin-resource clinical-resource-panel">
			<header>
				<h2>{w(config.title)}</h2>
				<div>
					{config.create && (
						<button type="button" disabled={busy} onClick={() => open(null)}>
							{w('create')}
						</button>
					)}
					<button
						type="button"
						disabled={loading || busy}
						onClick={() => void load()}
					>
						{w('refresh')}
					</button>
				</div>
			</header>
			{feedback && (
				<p className="clinical-admin-feedback" role="status">
					{feedback}
				</p>
			)}
			{error && (
				<p className="clinical-form-error" role="alert">
					{error}
				</p>
			)}
			{config.search && (
				<input
					className="clinical-resource-search"
					aria-label={w('search')}
					value={search}
					onChange={(e) => setSearch(e.target.value)}
					placeholder={w('search')}
				/>
			)}
			{editor !== undefined && (
				<form ref={formRef} className="clinical-resource-form" onSubmit={save}>
					<h3>{w(editor ? 'edit' : 'create')}</h3>
					{!editor && config.createDisabledReason && config.createDisabled && (
						<p role="status">{w(config.createDisabledReason)}</p>
					)}
					<fieldset disabled={busy || uploading}>
						{editorFields.map((field) =>
							field.type === 'calendar-dates' ? (
								<div key={field.name} style={{ gridColumn: '1 / -1' }}>
									<ServiceDateCalendar
										value={
											Array.isArray(draft[field.name]) ? draft[field.name] : []
										}
										onChange={(days) =>
											setDraft((current) => ({
												...current,
												[field.name]: days,
											}))
										}
									/>
								</div>
							) : (
								<label key={field.name}>
									{w(field.label)}
									{field.options && !(field.readonly && Boolean(editor)) ? (
										<select
											disabled={field.readonly && Boolean(editor)}
											required={field.required}
											value={String(draft[field.name] ?? '')}
											onChange={(e) =>
												setDraft((d) => ({
													...d,
													[field.name]: e.target.value,
												}))
											}
										>
											<option value="">{w('choose')}</option>
											{field.options.map((option) => {
												const value =
													typeof option === 'string' ? option : option.value;
												return (
													<option key={value} value={value}>
														{typeof option === 'string'
															? value.replaceAll('_', ' ')
															: option.label}
													</option>
												);
											})}
										</select>
									) : field.type === 'textarea' || field.type === 'array' ? (
										<textarea
											disabled={field.readonly && Boolean(editor)}
											required={field.required}
											maxLength={field.maxLength}
											minLength={field.minLength}
											value={
												Array.isArray(draft[field.name])
													? draft[field.name].join('\n')
													: (draft[field.name] ?? '')
											}
											onChange={(e) =>
												setDraft((d) => ({
													...d,
													[field.name]: e.target.value,
												}))
											}
										/>
									) : (
										<input
											type={field.type ?? 'text'}
											required={field.required}
											min={field.min}
											max={field.max}
											maxLength={field.maxLength}
											minLength={field.minLength}
											step={field.step}
											disabled={field.readonly && Boolean(editor)}
											checked={
												field.type === 'checkbox'
													? Boolean(draft[field.name])
													: undefined
											}
											value={
												field.type === 'checkbox'
													? undefined
													: field.type === 'datetime-local' && draft[field.name]
														? String(draft[field.name])
														: (draft[field.name] ?? '')
											}
											onChange={(e) =>
												setDraft((d) => ({
													...d,
													[field.name]:
														field.type === 'checkbox'
															? e.target.checked
															: e.target.value,
												}))
											}
										/>
									)}
									{field.imageTarget && (!field.readonly || !editor) && (
										<ImageUpload
											target={field.imageTarget}
											multiple={field.type === 'array'}
											onBusy={setUploading}
											onUploaded={(paths) =>
												setDraft((d) => ({
													...d,
													[field.name]:
														field.type === 'array'
															? [
																	...(Array.isArray(d[field.name])
																		? d[field.name]
																		: String(d[field.name] ?? '')
																				.split(/\r?\n/)
																				.filter(Boolean)),
																	...paths,
																].join('\n')
															: paths[0],
												}))
											}
										/>
									)}
								</label>
							),
						)}
					</fieldset>
					<div className="clinical-resource-actions">
						<button
							type="submit"
							disabled={busy || uploading || (!editor && config.createDisabled)}
						>
							{w('save')}
						</button>
						<button
							type="button"
							disabled={busy || uploading}
							onClick={() => setEditor(undefined)}
						>
							{w('cancel')}
						</button>
					</div>
				</form>
			)}
			{loading ? (
				<p className="clinical-staff-state">{t('dashboard.loading')}</p>
			) : !error && !rows.length ? (
				<p className="clinical-staff-state">{t('admin.noResults')}</p>
			) : (
				<div className="clinical-staff-table-scroll">
					<table>
						<thead>
							<tr>
								{config.columns.map((field) => (
									<th key={field.name}>{w(field.label)}</th>
								))}
								<th>{w('actions')}</th>
							</tr>
						</thead>
						<tbody>
							{filtered.map((record, index) => (
								<tr key={record._id ?? index}>
									{config.columns.map((field) => (
										<td key={field.name}>
											{config.thumbnail &&
											field.name === config.columns[0].name ? (
												<span className={thumbnailStyles.identity}>
													<RecordThumbnail
														image={
															Array.isArray(record[config.thumbnail.image])
																? record[config.thumbnail.image][0]
																: record[config.thumbnail.image]
														}
														name={String(
															record[config.thumbnail.name] ||
																record[field.name] ||
																'',
														)}
														portrait={config.thumbnail.portrait}
													/>
													<span>{String(record[field.name] ?? '—')}</span>
												</span>
											) : (
												<>
													{['appointmentCode', 'orderCode'].includes(field.name) ? recordReference(record[field.name]) : field.name === 'docReportFollowUp' && ['NONE', 'OPTIONAL', 'REQUIRED'].includes(record[field.name]) ? t(({ NONE: 'staff.none', OPTIONAL: 'staff.optional', REQUIRED: 'staff.required' } as const)[record[field.name] as 'NONE' | 'OPTIONAL' | 'REQUIRED']) : field.name === 'bookingOrderStatus'
														? settlementLabel(record[field.name])
														: field.name === 'appointmentStatus' &&
															  appointmentStatusKeys[
																	record[field.name] as AppointmentStatus
															  ]
															? t(
																	appointmentStatusKeys[
																		record[field.name] as AppointmentStatus
																	],
																)
															: [
																		'startsAt',
																		'endsAt',
																		'requestedStartAt',
                                                        'visitAt',
																  ].includes(field.name) &&
																  record[field.name] &&
																  Number.isFinite(
																		new Date(record[field.name]).getTime(),
																  )
																? clinicDateTime(
																		record[field.name],
																		'en-US',
																		clinic.timeZone,
																	)
																: Array.isArray(record[field.name])
																	? field.type === 'calendar-dates'
																		? record[field.name].length
																			? record[field.name]
																					.slice(0, 3)
																					.join(', ') +
																				(record[field.name].length > 3
																					? ` (+${record[field.name].length - 3})`
																					: '')
																			: w('schedule')
																		: record[field.name].join(', ')
																	: typeof record[field.name] === 'boolean'
																		? record[field.name]
																			? '✓'
																			: '—'
																		: String(
																				record[field.name] ?? '—',
																			).replaceAll('_', ' ')}
												</>
											)}
										</td>
									))}
									<td>
										<div className="clinical-resource-actions">
											{config.onSelect && (
												<button
													type="button"
													onClick={() => config.onSelect?.(record)}
												>
													{w('details')}
												</button>
											)}
											{config.update &&
												(!config.canEdit || config.canEdit(record)) && (
													<button
														type="button"
														disabled={busy}
														onClick={() => open(record)}
													>
														{w('edit')}
													</button>
												)}
											{config.remove &&
												(!config.canRemove || config.canRemove(record)) && (
													<button
														type="button"
														disabled={busy}
														onClick={() => void remove(record)}
													>
														{w('remove')}
													</button>
												)}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
			{!config.arrayResult && (
				<AdminPagination
					page={page}
					total={total}
					limit={10}
					onChange={setPage}
				/>
			)}
		</section>
	);
}
