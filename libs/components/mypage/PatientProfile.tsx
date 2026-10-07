import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';
import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { GET_MY_PATIENT_PROFILE } from '@/apollo/patient/query';
import {
	CREATE_PATIENT_PROFILE,
	UPDATE_MY_PATIENT_PROFILE,
	UPLOAD_MY_PATIENT_IMAGE,
} from '@/apollo/patient/mutation';
import { UPDATE_MEMBER } from '@/apollo/member/mutation';
import { userVar } from '@/apollo/store';
import { logOut, refreshMemberSession } from '@/libs/auth';
import { MemberSession } from '@/libs/components/member/types/member';
import {
	PatientBloodType,
	PatientGender,
} from '@/libs/components/patient/enums/patient.enum';
import { resolveApiAsset } from '@/libs/config';
import Icon from '@/libs/components/common/Icon';
import FollowLists from '@/libs/components/follow/FollowLists';
import PatientActivity from './PatientActivity';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useTranslation } from '@/libs/i18n/useTranslation';

interface PatientFormState {
	patientBloodType: PatientBloodType | '';
	patientGender: PatientGender | '';
	patientBirthDate: string;
	patientIdNumber: string;
	patientFullName: string;
	patientAddress: string;
	patientDesc: string;
	patientImage: string;
}

const emptyForm: PatientFormState = {
	patientBloodType: '',
	patientGender: '',
	patientBirthDate: '',
	patientIdNumber: '',
	patientFullName: '',
	patientAddress: '',
	patientDesc: '',
	patientImage: '',
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const PATIENT_IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
const PHONE_PATTERN = /^(?:\+?[1-9]\d{7,14}|0\d{1,2}-?\d{3,4}-?\d{4})$/;

const toDateInput = (value?: string) => {
	if (!value) return '';
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

const PatientProfile = () => {
	const w = useWorkspaceText();
	const t = useTranslation();
	const session = useReactiveVar(userVar);
	const [editing, setEditing] = useState(false);
	const [form, setForm] = useState<PatientFormState>(emptyForm);
	const [formError, setFormError] = useState('');
	const [photoFile, setPhotoFile] = useState<File | null>(null);
	const [photoPreview, setPhotoPreview] = useState('');
	const [editingContact, setEditingContact] = useState(false);
	const [contact, setContact] = useState({ memberPhone: '', memberMail: '' });
	const [contactError, setContactError] = useState('');
	const { data, loading, error, refetch } = useQuery(GET_MY_PATIENT_PROFILE, {
		skip: !session._id || session.memberType !== MemberType.PATIENT,
		fetchPolicy: 'cache-and-network',
	});
	const [createProfile, createState] = useMutation(CREATE_PATIENT_PROFILE);
	const [updateProfile, updateState] = useMutation(UPDATE_MY_PATIENT_PROFILE);
	const [uploadImage, uploadState] = useMutation(UPLOAD_MY_PATIENT_IMAGE);
	const [updateMember, memberState] = useMutation(UPDATE_MEMBER);
	const patient = data?.getMyPatientProfile;
	const profileMissing =
		!loading &&
		!patient &&
		(!error || error.message.includes('No data is found'));

	useEffect(() => {
		if (!patient) return;
		setForm({
			patientBloodType: patient.patientBloodType,
			patientGender: patient.patientGender,
			patientBirthDate: toDateInput(patient.patientBirthDate),
			patientIdNumber: patient.patientIdNumber ?? '',
			patientFullName: patient.patientFullName ?? '',
			patientAddress: patient.patientAddress ?? '',
			patientDesc: patient.patientDesc ?? '',
			patientImage: patient.patientImage ?? '',
		});
	}, [patient]);

	useEffect(() => {
		setContact({
			memberPhone: session.memberPhone ?? '',
			memberMail: session.memberMail ?? '',
		});
	}, [session.memberPhone, session.memberMail]);

	useEffect(() => {
		if (!photoFile) {
			setPhotoPreview('');
			return;
		}
		const preview = URL.createObjectURL(photoFile);
		setPhotoPreview(preview);
		return () => URL.revokeObjectURL(preview);
	}, [photoFile]);

	const updateField = (field: keyof PatientFormState, value: string) => {
		setForm((current) => ({ ...current, [field]: value }));
		setFormError('');
	};

	const selectPhoto = (file?: File) => {
		if (!file) return;
		if (!PATIENT_IMAGE_TYPES.includes(file.type)) {
			setPhotoFile(null);
			setFormError(t('patient.photoTypeError'));
			return;
		}
		if (file.size > MAX_IMAGE_BYTES) {
			setPhotoFile(null);
			setFormError(t('patient.photoSizeError'));
			return;
		}
		setPhotoFile(file);
		setFormError('');
	};

	const submitProfile = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setFormError('');
		if (
			!form.patientBloodType ||
			!form.patientGender ||
			!form.patientBirthDate ||
			!form.patientIdNumber.trim()
		) {
			setFormError(t('patient.requiredError'));
			return;
		}

		const input = {
			patientBloodType: form.patientBloodType as PatientBloodType,
			patientGender: form.patientGender as PatientGender,
			patientBirthDate: new Date(
				`${form.patientBirthDate}T00:00:00.000Z`,
			).toISOString(),
			patientIdNumber: form.patientIdNumber.trim(),
			patientFullName: form.patientFullName.trim() || undefined,
			patientAddress: form.patientAddress.trim() || undefined,
			patientDesc: form.patientDesc.trim() || undefined,
			patientImage: form.patientImage,
		};

		try {
			if (photoFile) {
				const uploaded = await uploadImage({ variables: { file: photoFile } });
				const imagePath = uploaded.data?.uploadMyPatientImage;
				if (!imagePath) throw new Error(t('patient.uploadError'));
				input.patientImage = imagePath;
				setForm((current) => ({ ...current, patientImage: imagePath }));
				setPhotoFile(null);
			}
			if (patient) await updateProfile({ variables: { input } });
			else await createProfile({ variables: { input } });
			await refetch();
			setPhotoFile(null);
			setEditing(false);
		} catch (requestError: any) {
			setFormError(requestError?.message ?? t('patient.saveError'));
		}
	};

	const saveContact = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setContactError('');
		const memberPhone = contact.memberPhone.trim();
		const memberMail = contact.memberMail.trim().toLowerCase();
		const phoneChanged = memberPhone !== (session.memberPhone ?? '');
		const mailChanged = memberMail !== (session.memberMail ?? '');
		if (phoneChanged && (!memberPhone || !PHONE_PATTERN.test(memberPhone))) {
			setContactError(t('patient.phoneError'));
			return;
		}
		if (
			mailChanged &&
			(!memberMail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(memberMail))
		) {
			setContactError(t('patient.emailError'));
			return;
		}
		if (!phoneChanged && !mailChanged) {
			setEditingContact(false);
			return;
		}
		try {
			const input: { _id: string; memberPhone?: string; memberMail?: string } =
				{ _id: session._id };
			if (phoneChanged) input.memberPhone = memberPhone;
			if (mailChanged) input.memberMail = memberMail;
			const result = await updateMember({ variables: { input } });
			const member = result.data?.updateMember as MemberSession | undefined;
			if (!member?.accessToken) throw new Error(t('patient.contactSaveError'));
			refreshMemberSession(member);
			setEditingContact(false);
		} catch (requestError: any) {
			setContactError(requestError?.message ?? t('patient.contactSaveError'));
		}
	};

	const startEditing = () => {
		setFormError('');
		setEditing(true);
	};
	const displayName =
		patient?.patientFullName ||
		session.memberFullName ||
		session.memberNick ||
		t('patient.nameFallback');
	const initials = displayName
		.split(' ')
		.map((part: string) => part[0])
		.join('')
		.slice(0, 2)
		.toUpperCase();
	const saving =
		createState.loading || updateState.loading || uploadState.loading;
	const genderLabels = {
		[PatientGender.MALE]: t('patient.genderMale'),
		[PatientGender.FEMALE]: t('patient.genderFemale'),
		[PatientGender.OTHER]: t('patient.genderOther'),
	};
	const statusLabels: Record<string, string> = {
		ACTIVE: t('patient.statusActive'),
		BLOCK: t('patient.statusBlock'),
		DELETE: t('patient.statusDelete'),
	};

	if (!session._id)
		return (
			<section className="clinical-inner-section clinical-auth-gate">
				<span className="clinical-profile-large">
					<Icon name="lock" />
				</span>
				<span className="clinical-section-kicker">
					{t('page.patientPortal')}
				</span>
				<h2>{t('patient.signinTitle')}</h2>
				<p>{t('patient.signinIntro')}</p>
				<div>
					<Link className="clinical-primary-button" href="/account/signin">
						{t('patient.signin')}
					</Link>
					<Link className="clinical-secondary-button" href="/account/join">
						{t('patient.join')}
					</Link>
				</div>
			</section>
		);
	if (session.memberType === MemberType.DOCTOR)
		return (
			<section className="clinical-inner-section clinical-auth-gate">
				<span className="clinical-section-kicker">
					{t('patient.doctorKicker')}
				</span>
				<h2>{t('patient.doctorTitle')}</h2>
				<p>{t('patient.doctorIntro')}</p>
				<div className="clinical-profile-actions">
					<Link className="clinical-primary-button" href="/mypage/dashboard">
						{t('dashboard.title')}
					</Link>
					<Link className="clinical-secondary-button" href="/doctor-workspace/messages">
						{t('messages.title')}
					</Link>
					<Link
						className="clinical-secondary-button"
						href="/doctor-workspace/notifications"
					>
						{t('notifications.title')}
					</Link>
					<Link
						className="clinical-secondary-button"
						href="/doctor-workspace/profile"
					>
						{t('dashboard.profileLink')}
					</Link>
					<button
						className="clinical-secondary-button"
						type="button"
						onClick={() => void logOut()}
					>
						{t('patient.signoutTitle')}
					</button>
				</div>
			</section>
		);
	if (session.memberType !== MemberType.PATIENT)
		return (
			<section className="clinical-inner-section clinical-auth-gate">
				<span className="clinical-section-kicker">{t('page.profile')}</span>
				<h2>{session.memberFullName || session.memberNick}</h2>
				<p>{t('messages.intro')}</p>
				<div className="clinical-profile-actions">
					<Link className="clinical-primary-button" href="/mypage/dashboard">
						{t('dashboard.title')}
					</Link>
					<Link className="clinical-secondary-button" href="/mypage/messages">
						{t('messages.title')}
					</Link>
					<Link
						className="clinical-secondary-button"
						href="/mypage/notifications"
					>
						{t('notifications.title')}
					</Link>
					<button
						className="clinical-secondary-button"
						type="button"
						onClick={() => void logOut()}
					>
						{t('patient.signoutTitle')}
					</button>
				</div>
			</section>
		);
	if (loading && !patient)
		return (
			<section className="clinical-inner-section">
				<p className="clinical-query-status">{t('patient.loading')}</p>
			</section>
		);
	if (error && !profileMissing && !patient)
		return (
			<section className="clinical-inner-section">
				<p className="clinical-form-error">{t('patient.unavailable')}</p>
				<button
					className="clinical-secondary-button"
					type="button"
					onClick={() => void refetch()}
				>
					{t('patient.retry')}
				</button>
			</section>
		);

	return (
		<>
			<section className="clinical-inner-section clinical-patient-profile">
				{patient && (
					<>
						<div className="clinical-patient-identity">
							<span
								className="clinical-profile-large"
								style={
									patient.patientImage
										? {
												backgroundImage: `url(${resolveApiAsset(patient.patientImage)})`,
											}
										: undefined
								}
							>
								{patient.patientImage ? null : initials}
							</span>
							<div>
								<span className="clinical-section-kicker">
									{t('patient.profileKicker')}
								</span>
								<h2>{displayName}</h2>
								<p>
									{t('patient.patientId')}: {patient.patientIdNumber} ·{' '}
									{statusLabels[String(patient.memberStatus)] ??
										String(patient.memberStatus)}
								</p>
							</div>
						</div>
						{!editing && (
							<div className="clinical-profile-actions">
								<button
									className="clinical-primary-button"
									type="button"
									onClick={startEditing}
								>
									{t('patient.updateButton')} <Icon name="edit" />
								</button>
							</div>
						)}
					</>
				)}
				{profileMissing && (
					<div>
						<span className="clinical-section-kicker">
							{t('patient.setupKicker')}
						</span>
						<h2>{t('patient.setupTitle')}</h2>
						<p className="clinical-query-status">{t('patient.setupIntro')}</p>
					</div>
				)}
				<div className="clinical-profile-contact">
					<span>
						<Icon name="call" />
						<small>{t('patient.phone')}</small>
						<b>{session.memberPhone || t('patient.notProvided')}</b>
					</span>
					<span>
						<Icon name="mail" />
						<small>{t('patient.email')}</small>
						<b>{session.memberMail || t('patient.notProvided')}</b>
					</span>
					{patient && (
						<span>
							<Icon name="favorite" />
							<small>{t('patient.bloodType')}</small>
							<b>{patient.patientBloodType.replace('_', ' ')}</b>
						</span>
					)}
				</div>
				{(profileMissing || editing) && (
					<form
						className="clinical-contact-form clinical-patient-form"
						onSubmit={submitProfile}
					>
						<span className="clinical-section-kicker">
							{t('patient.secureData')}
						</span>
						<h2>
							{patient ? t('patient.updateTitle') : t('patient.createTitle')}
						</h2>
						<label className="clinical-photo-field">
							{t('patient.photo')}
							<span className="clinical-photo-row">
								<span
									className="clinical-profile-large"
									style={
										photoPreview || form.patientImage
											? {
													backgroundImage: `url(${photoPreview || resolveApiAsset(form.patientImage)})`,
												}
											: undefined
									}
								>
									{photoPreview || form.patientImage ? null : initials}
								</span>
								<span>
									<input
										type="file"
										accept="image/png,image/jpeg"
										onChange={(event) => selectPhoto(event.target.files?.[0])}
									/>
									<small>{t('patient.photoHint')}</small>
								</span>
							</span>
						</label>
						<div className="clinical-patient-form-grid">
							<label>
								{t('patient.fullName')}
								<input
									value={form.patientFullName}
									onChange={(event) =>
										updateField('patientFullName', event.target.value)
									}
									placeholder={t('patient.fullNamePlaceholder')}
								/>
							</label>
							<label>
								{t('patient.identityNumber')}
								<input
									value={form.patientIdNumber}
									onChange={(event) =>
										updateField('patientIdNumber', event.target.value)
									}
									placeholder={t('patient.identityPlaceholder')}
									required
								/>
							</label>
							<label>
								{t('patient.bloodType')}
								<select
									value={form.patientBloodType}
									onChange={(event) =>
										updateField('patientBloodType', event.target.value)
									}
									required
								>
									<option value="">{t('patient.selectBlood')}</option>
									{Object.values(PatientBloodType).map((value) => (
										<option key={value} value={value}>
											{value.replace('_', ' ')}
										</option>
									))}
								</select>
							</label>
							<label>
								{t('patient.gender')}
								<select
									value={form.patientGender}
									onChange={(event) =>
										updateField('patientGender', event.target.value)
									}
									required
								>
									<option value="">{t('patient.selectGender')}</option>
									{Object.values(PatientGender).map((value) => (
										<option key={value} value={value}>
											{genderLabels[value]}
										</option>
									))}
								</select>
							</label>
							<label>
								{t('patient.birthDate')}
								<input
									type="date"
									value={form.patientBirthDate}
									onChange={(event) =>
										updateField('patientBirthDate', event.target.value)
									}
									required
								/>
							</label>
							<label>
								{t('patient.address')}
								<input
									value={form.patientAddress}
									onChange={(event) =>
										updateField('patientAddress', event.target.value)
									}
									placeholder={t('patient.addressPlaceholder')}
								/>
							</label>
						</div>
						<label>
							{t('patient.aboutYou')}
							<textarea
								rows={4}
								value={form.patientDesc}
								onChange={(event) =>
									updateField('patientDesc', event.target.value)
								}
								placeholder={t('patient.notesPlaceholder')}
							/>
						</label>
						{formError && <p className="clinical-form-error">{formError}</p>}
						<div className="clinical-profile-actions">
							<button
								className="clinical-primary-button"
								type="submit"
								disabled={saving}
							>
								{saving
									? t('patient.saving')
									: patient
										? t('patient.saveChanges')
										: t('patient.createProfile')}
							</button>
							{patient && (
								<button
									className="clinical-secondary-button"
									type="button"
									onClick={() => {
										setEditing(false);
										setFormError('');
										setPhotoFile(null);
									}}
								>
									{t('patient.cancel')}
								</button>
							)}
						</div>
					</form>
				)}
				<div className="clinical-account-contact">
					<div>
						<span className="clinical-section-kicker">
							{t('patient.contactKicker')}
						</span>
						<h2>{t('patient.contactTitle')}</h2>
						<p>{t('patient.contactIntro')}</p>
					</div>
					{!editingContact && (
						<div className="clinical-profile-actions">
							<button
								className="clinical-secondary-button"
								type="button"
								onClick={() => {
									setContactError('');
									setEditingContact(true);
								}}
							>
								{t('patient.editContact')} <Icon name="edit" />
							</button>
						</div>
					)}
					{editingContact && (
						<form
							className="clinical-contact-form clinical-patient-form"
							onSubmit={saveContact}
						>
							<div className="clinical-patient-form-grid">
								<label>
									{t('patient.phoneNumber')}
									<input
										type="tel"
										autoComplete="tel"
										value={contact.memberPhone}
										onChange={(event) => {
											setContact({
												...contact,
												memberPhone: event.target.value,
											});
											setContactError('');
										}}
										placeholder="+821012345678"
									/>
								</label>
								<label>
									{t('patient.emailAddress')}
									<input
										type="email"
										autoComplete="email"
										value={contact.memberMail}
										onChange={(event) => {
											setContact({
												...contact,
												memberMail: event.target.value,
											});
											setContactError('');
										}}
										placeholder="name@example.com"
									/>
								</label>
							</div>
							{contactError && (
								<p className="clinical-form-error">{contactError}</p>
							)}
							<div className="clinical-profile-actions">
								<button
									className="clinical-primary-button"
									type="submit"
									disabled={memberState.loading}
								>
									{memberState.loading
										? t('patient.saving')
										: t('patient.saveContact')}
								</button>
								<button
									className="clinical-secondary-button"
									type="button"
									onClick={() => {
										setContact({
											memberPhone: session.memberPhone ?? '',
											memberMail: session.memberMail ?? '',
										});
										setContactError('');
										setEditingContact(false);
									}}
								>
									{t('patient.cancel')}
								</button>
							</div>
						</form>
					)}
				</div>
				{patient && !editing && error ? (
					<p className="clinical-form-error">{t('patient.staleProfile')}</p>
				) : null}
			</section>
			<FollowLists profileId={session._id} kind="patient" />
			<PatientActivity />
			<section className="clinical-mypage-grid">
				{(
					[
						'cart',
						'bookings',
						'payments',
						'appointments',
						'reports',
						'notices',
					] as const
				).map((page) => (
					<Link
						key={page}
						href={page === 'notices' ? '/notices' : `/mypage/${page}`}
					>
						<Icon
							name={
								page === 'reports'
									? 'description'
									: page === 'payments'
										? 'payments'
										: 'event'
							}
						/>
						<div>
							<h3>{w(page === 'appointments' ? 'appointment' : page)}</h3>
						</div>
						<Icon name="arrow_forward" />
					</Link>
				))}
				<Link href="/mypage/messages">
					<Icon name="mail" />
					<div>
						<h3>{t('messages.title')}</h3>
						<p>{t('messages.intro')}</p>
					</div>
					<Icon name="arrow_forward" />
				</Link>
				<Link href="/mypage/notifications">
					<Icon name="notifications" />
					<div>
						<h3>{t('notifications.title')}</h3>
						<p>{t('notifications.intro')}</p>
					</div>
					<Icon name="arrow_forward" />
				</Link>
				<Link href="/appointment">
					<Icon name="calendar_month" />
					<div>
						<h3>{t('patient.bookTitle')}</h3>
						<p>{t('patient.bookIntro')}</p>
					</div>
					<Icon name="arrow_forward" />
				</Link>
				<Link href="/doctor">
					<Icon name="stethoscope" />
					<div>
						<h3>{t('patient.findTitle')}</h3>
						<p>{t('patient.findIntro')}</p>
					</div>
					<Icon name="arrow_forward" />
				</Link>
				<Link href="/service">
					<Icon name="medical_services" />
					<div>
						<h3>{t('patient.serviceTitle')}</h3>
						<p>{t('patient.serviceIntro')}</p>
					</div>
					<Icon name="arrow_forward" />
				</Link>
				<button type="button" onClick={() => void logOut()}>
					<Icon name="logout" />
					<div>
						<h3>{t('patient.signoutTitle')}</h3>
						<p>{t('patient.signoutIntro')}</p>
					</div>
					<Icon name="arrow_forward" />
				</button>
			</section>
		</>
	);
};

export default PatientProfile;
