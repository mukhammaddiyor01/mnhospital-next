import { FormEvent, useEffect, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { GET_MY_PATIENT_PROFILE } from '@/apollo/patient/query';
import { CREATE_PATIENT_PROFILE, UPDATE_MY_PATIENT_PROFILE } from '@/apollo/patient/mutation';
import { userVar } from '@/apollo/store';
import { logOut } from '@/libs/auth';
import { PatientBloodType, PatientGender } from '@/libs/components/patient/enums/patient.enum';
import { resolveApiAsset } from '@/libs/config';
import Icon from '@/libs/components/common/Icon';
import FollowLists from '@/libs/components/follow/FollowLists';
import PatientActivity from './PatientActivity';
import { MemberType } from '@/libs/components/member/enums/member.enum';

interface PatientFormState {
	patientBloodType: PatientBloodType | '';
	patientGender: PatientGender | '';
	patientBirthDate: string;
	patientIdNumber: string;
	patientFullName: string;
	patientAddress: string;
	patientDesc: string;
}

const emptyForm: PatientFormState = {
	patientBloodType: '',
	patientGender: '',
	patientBirthDate: '',
	patientIdNumber: '',
	patientFullName: '',
	patientAddress: '',
	patientDesc: '',
};

const toDateInput = (value?: string) => {
	if (!value) return '';
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
};

const PatientProfile = () => {
	const session = useReactiveVar(userVar);
	const [editing, setEditing] = useState(false);
	const [form, setForm] = useState<PatientFormState>(emptyForm);
	const [formError, setFormError] = useState('');
	const { data, loading, error, refetch } = useQuery(GET_MY_PATIENT_PROFILE, {
		skip: !session._id,
		fetchPolicy: 'cache-and-network',
	});
	const [createProfile, createState] = useMutation(CREATE_PATIENT_PROFILE);
	const [updateProfile, updateState] = useMutation(UPDATE_MY_PATIENT_PROFILE);
	const patient = data?.getMyPatientProfile;
	const profileMissing = !loading && !patient && (!error || error.message.includes('No data is found'));

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
		});
	}, [patient]);

	const updateField = (field: keyof PatientFormState, value: string) => {
		setForm((current) => ({ ...current, [field]: value }));
		setFormError('');
	};

	const submitProfile = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		setFormError('');
		if (!form.patientBloodType || !form.patientGender || !form.patientBirthDate || !form.patientIdNumber.trim()) {
			setFormError('Blood type, gender, birth date, and identity number are required.');
			return;
		}

		const input = {
			patientBloodType: form.patientBloodType as PatientBloodType,
			patientGender: form.patientGender as PatientGender,
			patientBirthDate: new Date(`${form.patientBirthDate}T00:00:00.000Z`).toISOString(),
			patientIdNumber: form.patientIdNumber.trim(),
			patientFullName: form.patientFullName.trim() || undefined,
			patientAddress: form.patientAddress.trim() || undefined,
			patientDesc: form.patientDesc.trim() || undefined,
		};

		try {
			if (patient) await updateProfile({ variables: { input } });
			else await createProfile({ variables: { input } });
			await refetch();
			setEditing(false);
		} catch (requestError: any) {
			setFormError(requestError?.message ?? 'Patient profile could not be saved.');
		}
	};

	const startEditing = () => {
		setFormError('');
		setEditing(true);
	};
	const displayName = patient?.patientFullName || session.memberFullName || session.memberNick || 'MN Hospital patient';
	const initials = displayName.split(' ').map((part: string) => part[0]).join('').slice(0, 2).toUpperCase();
	const saving = createState.loading || updateState.loading;

	if (!session._id) return <section className="clinical-inner-section clinical-auth-gate"><span className="clinical-profile-large"><Icon name="lock" /></span><span className="clinical-section-kicker">PATIENT PORTAL</span><h2>Sign in to view your care profile.</h2><p>Your appointments, account details, and hospital activity are protected.</p><div><Link className="clinical-primary-button" href="/account/signin">Sign In</Link><Link className="clinical-secondary-button" href="/account/join">Create account</Link></div></section>;
	if (session.memberType === MemberType.DOCTOR) return <section className="clinical-inner-section clinical-auth-gate"><span className="clinical-section-kicker">DOCTOR PROFILE</span><h2>Your doctor profile</h2><p>View your followers, services, and articles.</p><Link className="clinical-primary-button" href={`/doctor/${session._id}`}>Open profile</Link></section>;
	if (loading && !patient) return <section className="clinical-inner-section"><p className="clinical-query-status">Loading your patient profile…</p></section>;
	if (error && !profileMissing && !patient) return <section className="clinical-inner-section"><p className="clinical-form-error">Patient profile is temporarily unavailable.</p><button className="clinical-secondary-button" type="button" onClick={() => void refetch()}>Retry</button></section>;

	return <>
		<section className="clinical-inner-section clinical-patient-profile">
			{patient && <>
				<div className="clinical-patient-identity"><span className="clinical-profile-large" style={patient.patientImage ? { backgroundImage: `url(${resolveApiAsset(patient.patientImage)})` } : undefined}>{patient.patientImage ? null : initials}</span><div><span className="clinical-section-kicker">PATIENT PROFILE</span><h2>{displayName}</h2><p>Patient ID: {patient.patientIdNumber} · {String(patient.memberStatus).toLowerCase()}</p></div></div>
				<div className="clinical-profile-contact"><span><Icon name="call" /><small>Phone</small><b>{session.memberPhone || 'Not provided'}</b></span><span><Icon name="mail" /><small>Email</small><b>{session.memberMail || 'Not provided'}</b></span><span><Icon name="favorite" /><small>Blood type</small><b>{patient.patientBloodType.replace('_', ' ')}</b></span></div>
				{!editing && <div className="clinical-profile-actions"><button className="clinical-primary-button" type="button" onClick={startEditing}>Update patient profile <Icon name="edit" /></button></div>}
			</>}
			{profileMissing && <div><span className="clinical-section-kicker">PATIENT PROFILE SETUP</span><h2>Complete your patient profile.</h2><p className="clinical-query-status">Your account is ready. Add the required medical details to continue booking care.</p></div>}
			{(profileMissing || editing) && <form className="clinical-contact-form clinical-patient-form" onSubmit={submitProfile}><span className="clinical-section-kicker">SECURE PATIENT DATA</span><h2>{patient ? 'Update your profile' : 'Create your profile'}</h2><div className="clinical-patient-form-grid"><label>Full name<input value={form.patientFullName} onChange={(event) => updateField('patientFullName', event.target.value)} placeholder="Your full name" /></label><label>Identity number<input value={form.patientIdNumber} onChange={(event) => updateField('patientIdNumber', event.target.value)} placeholder="Passport or ID number" required /></label><label>Blood type<select value={form.patientBloodType} onChange={(event) => updateField('patientBloodType', event.target.value)} required><option value="">Select blood type</option>{Object.values(PatientBloodType).map((value) => <option key={value} value={value}>{value.replace('_', ' ')}</option>)}</select></label><label>Gender<select value={form.patientGender} onChange={(event) => updateField('patientGender', event.target.value)} required><option value="">Select gender</option>{Object.values(PatientGender).map((value) => <option key={value} value={value}>{value}</option>)}</select></label><label>Birth date<input type="date" value={form.patientBirthDate} onChange={(event) => updateField('patientBirthDate', event.target.value)} required /></label><label>Address<input value={form.patientAddress} onChange={(event) => updateField('patientAddress', event.target.value)} placeholder="Home address" /></label></div><label>About you<textarea rows={4} value={form.patientDesc} onChange={(event) => updateField('patientDesc', event.target.value)} placeholder="Optional care notes" /></label>{formError && <p className="clinical-form-error">{formError}</p>}<div className="clinical-profile-actions"><button className="clinical-primary-button" type="submit" disabled={saving}>{saving ? 'Saving…' : patient ? 'Save changes' : 'Create profile'}</button>{patient && <button className="clinical-secondary-button" type="button" onClick={() => { setEditing(false); setFormError(''); }}>Cancel</button>}</div></form>}
			{patient && !editing && error ? <p className="clinical-form-error">Live profile data is unavailable. Showing your last patient profile.</p> : null}
		</section>
		<FollowLists profileId={session._id} kind="patient" />
		<PatientActivity />
		<section className="clinical-mypage-grid"><Link href="/appointment"><Icon name="calendar_month" /><div><h3>Book an appointment</h3><p>Choose a service, specialist, and available time.</p></div><Icon name="arrow_forward" /></Link><Link href="/doctor"><Icon name="stethoscope" /><div><h3>Find a specialist</h3><p>Browse doctors by name and medical specialty.</p></div><Icon name="arrow_forward" /></Link><Link href="/service"><Icon name="medical_services" /><div><h3>Explore services</h3><p>Review active hospital services and departments.</p></div><Icon name="arrow_forward" /></Link><button type="button" onClick={() => void logOut()}><Icon name="logout" /><div><h3>Sign out</h3><p>Securely close your current patient session.</p></div><Icon name="arrow_forward" /></button></section>
	</>;
};

export default PatientProfile;
