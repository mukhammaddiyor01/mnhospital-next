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
	step?: string;
	options?: (string | { value: string; label: string })[];
	readonly?: boolean;
	imageTarget?: string;
	defaultValue?: string | boolean;
};
export type ResourceConfig = {
	role: MemberType;
	title: WorkspaceTextKey;
	list: DocumentNode;
	listKey: string;
	mutationList?: boolean;
	variables?: (page: number) => RecordItem;
	columns: ResourceField[];
	fields?: ResourceField[];
	create?: DocumentNode;
	update?: DocumentNode;
	createVariables?: (input: RecordItem) => RecordItem;
	updateVariables?: (input: RecordItem, record: RecordItem) => RecordItem;
	remove?: DocumentNode;
	removeVariables?: (record: RecordItem) => RecordItem;
	canEdit?: (record: RecordItem) => boolean;
	canRemove?: (record: RecordItem) => boolean;
	onSelect?: (record: RecordItem) => void;
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
	const load = useCallback(async () => {
		if (!authorized) return;
		const generation = ++request.current;
		setLoading(true);
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
			setRows(config.arrayResult ? (data ?? []) : (data?.list ?? []));
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
	}, [authorized, client, config, page]);
	useEffect(() => {
		void load();
		return () => {
			request.current++;
		};
	}, [load]);
	useEffect(() => {
		if (editor !== undefined)
			formRef.current
				?.querySelector<HTMLInputElement>('input,select,textarea')
				?.focus();
	}, [editor]);
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
		const operation = editor ? config.update : config.create;
		if (!operation) return;
		const input: RecordItem = {};
		for (const field of config.fields ?? []) {
			if (field.readonly && editor) continue;
			const value = draft[field.name];
			if (value === '' || value == null) {
				if (field.required) {
					setFeedback(`${w(field.label)}: ${w('choose')}`);
					return;
				}
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
		} catch (e: any) {
			setFeedback(e.message ?? t('admin.actionError'));
		} finally {
			pending.current = false;
			setBusy(false);
		}
	};
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
					<fieldset disabled={busy || uploading}>
						{(config.fields ?? []).map((field) => (
							<label key={field.name}>
								{w(field.label)}
								{field.options ? (
									<select
										disabled={field.readonly && Boolean(editor)}
										required={field.required}
										value={String(draft[field.name] ?? '')}
										onChange={(e) =>
											setDraft((d) => ({ ...d, [field.name]: e.target.value }))
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
										value={
											Array.isArray(draft[field.name])
												? draft[field.name].join('\n')
												: (draft[field.name] ?? '')
										}
										onChange={(e) =>
											setDraft((d) => ({ ...d, [field.name]: e.target.value }))
										}
									/>
								) : (
									<input
										type={field.type ?? 'text'}
										required={field.required}
										min={field.min}
										max={field.max}
										maxLength={field.maxLength}
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
						))}
					</fieldset>
					<div className="clinical-resource-actions">
						<button type="submit" disabled={busy || uploading}>
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
											{Array.isArray(record[field.name])
												? record[field.name].join(', ')
												: typeof record[field.name] === 'boolean'
													? record[field.name]
														? '✓'
														: '—'
													: String(record[field.name] ?? '—').replaceAll(
															'_',
															' ',
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
