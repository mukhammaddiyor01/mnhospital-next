import { FormEvent, useRef, useState } from 'react';
import { gql, useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { GET_MY_MEMBER_PROFILE } from '@/apollo/member/query';
import { GET_DOCTOR_PROFILE, GET_RECEPTIONIST_PROFILE } from '@/apollo/staff-workspace/query';
import { CHANGE_ACCOUNT_PASSWORD, UPDATE_ACCOUNT_PROFILE } from '@/apollo/auth/mutation';
import { applySessionToken, ensureAccessToken, withBrowserSessionLock } from '@/libs/auth/session';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import StaffProfileCard from '@/libs/components/dashboard/StaffProfileCard';
import { resolveApiAsset } from '@/libs/config';
import { useDoctorSpecialtyLabel } from '@/libs/i18n/useDoctorSpecialtyLabel';
import { useWorkspaceText, WorkspaceTextKey } from './useWorkspaceText';
import ImageUpload from './ImageUpload';

const ADMIN_PROFILE = gql`
	query GetMyAdminEditableProfile {
		getMyAdminProfile {
			_id
			memberType
			adminNick
			adminPhone
			adminMail
			adminImage
			adminDesc
		}
	}
`;
const profiles = {
	[MemberType.PATIENT]: { query: GET_MY_MEMBER_PROFILE, key: 'getMyMemberProfile', prefix: 'member', target: 'member' },
	[MemberType.DOCTOR]: { query: GET_DOCTOR_PROFILE, key: 'getMyDoctorProfile', prefix: 'doc', target: 'doctor' },
	[MemberType.RECEPTIONIST]: {
		query: GET_RECEPTIONIST_PROFILE,
		key: 'getMyReceptionistProfile',
		prefix: 'receptionist',
		target: 'receptionist',
	},
	[MemberType.ADMIN]: { query: ADMIN_PROFILE, key: 'getMyAdminProfile', prefix: 'admin', target: 'admin' },
};
const labels: Record<string, WorkspaceTextKey> = {
	nickname: 'nickname',
	fullName: 'fullName',
	phone: 'phone',
	email: 'email',
	address: 'address',
	description: 'description',
	experience: 'experience',
};
const suffixes: Record<string, string> = {
	nickname: 'Nick',
	fullName: 'FullName',
	phone: 'Phone',
	email: 'Mail',
	address: 'Address',
	description: 'Desc',
	image: 'Image',
	experience: 'Experience',
};

export default function AccountProfileEditor({ role }: { role: MemberType }) {
	const w = useWorkspaceText();
	const specialtyLabel = useDoctorSpecialtyLabel();
	const session = useReactiveVar(userVar);
	const config = profiles[role];
	const profile = useQuery(config.query, {
		skip: !session._id || session.memberType !== role,
		fetchPolicy: 'network-only',
	});
	const record = profile.data?.[config.key];
	const [update, updateState] = useMutation(UPDATE_ACCOUNT_PROFILE);
	const [password, passwordState] = useMutation(CHANGE_ACCOUNT_PASSWORD);
	const [draft, setDraft] = useState<Record<string, string> | null>(null);
	const [uploading, setUploading] = useState(false);
	const [pending, setPending] = useState(false);
	const [feedback, setFeedback] = useState('');
	const [error, setError] = useState('');
	const locked = useRef(false);
	const fields = [
		'nickname',
		...(role !== MemberType.ADMIN ? ['fullName'] : []),
		'phone',
		'email',
		...([MemberType.DOCTOR, MemberType.RECEPTIONIST].includes(role) ? ['address'] : []),
		'description',
		...(role === MemberType.DOCTOR ? ['experience'] : []),
	];
	const value = (key: string) => String(record?.[config.prefix + suffixes[key]] ?? '');
	const currentOwner = () => userVar()._id === session._id && userVar().memberType === role;
	const open = () => {
		setDraft(Object.fromEntries([...fields, 'image'].map((key) => [key, value(key)])));
		setError('');
		setFeedback('');
	};
	const save = async (event: FormEvent) => {
		event.preventDefault();
		if (!draft || uploading || locked.current) return;
		locked.current = true;
		setPending(true);
		setFeedback('');
		setError('');
		try {
			const input = Object.fromEntries(
				Object.entries(draft)
					.filter(([key, item]) => item.trim() !== value(key))
					.map(([key, item]) => [key, key === 'experience' ? Number(item) : item.trim()]),
			);
			if (!Object.keys(input).length) {
				setDraft(null);
				return;
			}
			const result = await update({ variables: { input }, context: { expectedAccount: `${role}:${session._id}` } });
			if (!currentOwner()) return;
			applySessionToken(result.data.updateMyAccountProfile.accessToken);
			setDraft(null);
			setFeedback(w('saved'));
			await profile.refetch().catch(() => undefined);
		} catch (failure: any) {
			if (currentOwner()) setError(failure.message);
		} finally {
			locked.current = false;
			setPending(false);
		}
	};
	const changePassword = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (locked.current) return;
		const form = event.currentTarget;
		const values = new FormData(form);
		const currentPassword = String(values.get('currentPassword') ?? '');
		const newPassword = String(values.get('newPassword') ?? '');
		if (newPassword !== values.get('confirmPassword') || newPassword.length < 8 || newPassword.length > 32) {
			setError(w('passwordMismatch'));
			return;
		}
		locked.current = true;
		setPending(true);
		setError('');
		setFeedback('');
		try {
			await ensureAccessToken();
			await withBrowserSessionLock(async () => {
				if (!currentOwner()) return;
				const result = await password({
					variables: { input: { currentPassword, newPassword } },
					context: { sessionRetried: true, expectedAccount: `${role}:${session._id}` },
				});
				if (currentOwner()) applySessionToken(result.data.changeMyAccountPassword.accessToken);
			});
			if (!currentOwner()) return;
			form.reset();
			setDraft(null);
			setFeedback(w('passwordChanged'));
			await profile.refetch().catch(() => undefined);
		} catch (failure: any) {
			if (currentOwner()) setError(failure.message);
		} finally {
			locked.current = false;
			setPending(false);
		}
	};
	const busy = uploading || pending || updateState.loading || passwordState.loading;
	return (
		<>
			{profile.loading && <p role="status">{w('retry')}…</p>}
			{profile.error && (
				<p role="alert">
					{profile.error.message}{' '}
					<button type="button" onClick={() => void profile.refetch().catch(() => undefined)}>
						{w('refresh')}
					</button>
				</p>
			)}
			{record && (
				<>
					<StaffProfileCard
						name={value('fullName') || value('nickname')}
						nickname={value('nickname')}
						image={value('image')}
						facts={fields
							.filter((key) => !['nickname', 'fullName'].includes(key))
							.map((key) => ({ label: w(labels[key]), value: value(key) || '—' }))}
					>
						<button type="button" disabled={busy || Boolean(draft)} onClick={open}>
							{w('edit')}
						</button>
					</StaffProfileCard>
					{role === MemberType.DOCTOR && (
						<p>
							{w('specialty')}: {specialtyLabel(record.docSpecialty)} · {w('room')}: {record.docRoom}
						</p>
					)}
					{draft && (
						<section className="clinical-staff-panel clinical-resource-panel">
							<h2>{w('accountProfile')}</h2>
							<form className="clinical-staff-form clinical-staff-profile-form" onSubmit={save}>
								<fieldset disabled={busy} style={{ display: 'contents' }}>
									{fields.map((key) => (
										<label key={key}>
											{w(labels[key])}
											{key === 'description' ? (
												<textarea
													value={draft[key]}
													maxLength={2000}
													onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
												/>
											) : (
												<input
													value={draft[key]}
													type={
														key === 'email'
															? 'email'
															: key === 'phone'
																? 'tel'
																: key === 'experience'
																	? 'number'
																	: 'text'
													}
													min={key === 'experience' ? 0 : undefined}
													step={key === 'experience' ? 1 : undefined}
													minLength={key === 'nickname' ? 3 : key === 'fullName' ? 2 : undefined}
													maxLength={
														key === 'nickname' ? 30 : key === 'fullName' ? 100 : key === 'address' ? 300 : undefined
													}
													required={key === 'nickname' || key === 'experience'}
													onChange={(event) => setDraft({ ...draft, [key]: event.target.value })}
												/>
											)}
										</label>
									))}
									<div>
										<span>{w('image')}</span>
										{draft.image && (
											<img
												src={resolveApiAsset(draft.image)}
												alt={w('image')}
												width={96}
												height={96}
												style={{ objectFit: 'cover' }}
											/>
										)}
										<ImageUpload
											target={config.target}
											onBusy={setUploading}
											onUploaded={(paths) => setDraft((current) => (current ? { ...current, image: paths[0] } : null))}
										/>
										<button type="button" onClick={() => setDraft({ ...draft, image: '' })}>
											{w('remove')}
										</button>
									</div>
								</fieldset>
								<div className="clinical-staff-profile-buttons">
									<button type="submit" disabled={busy}>
										{w('save')}
									</button>
									<button type="button" disabled={busy} onClick={() => setDraft(null)}>
										{w('cancel')}
									</button>
								</div>
							</form>
						</section>
					)}
					<section className="clinical-staff-panel clinical-resource-panel">
						<h2>{w('changePassword')}</h2>
						<form className="clinical-staff-form clinical-staff-profile-form" onSubmit={changePassword}>
							<fieldset disabled={busy} style={{ display: 'contents' }}>
								<label>
									{w('currentPassword')}
									<input
										name="currentPassword"
										type="password"
										autoComplete="current-password"
										required
										maxLength={128}
									/>
								</label>
								<label>
									{w('newPassword')}
									<input
										name="newPassword"
										type="password"
										autoComplete="new-password"
										required
										minLength={8}
										maxLength={32}
									/>
								</label>
								<label>
									{w('confirmPassword')}
									<input
										name="confirmPassword"
										type="password"
										autoComplete="new-password"
										required
										minLength={8}
										maxLength={32}
									/>
								</label>
							</fieldset>
							<button type="submit" disabled={busy}>
								{w('changePassword')}
							</button>
						</form>
					</section>
				</>
			)}
			{feedback && (
				<p role="status" className="clinical-admin-feedback">
					{feedback}
				</p>
			)}
			{error && (
				<p role="alert" className="clinical-form-error">
					{error}
				</p>
			)}
		</>
	);
}
