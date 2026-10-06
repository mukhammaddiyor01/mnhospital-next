import { FormEvent, useState } from 'react';
import { useApolloClient, useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { GET_DOCTOR_PROFILE } from '@/apollo/staff-workspace/query';
import { UPDATE_DOCTOR_PROFILE } from '@/apollo/staff-workspace/mutation';
import { refreshMemberSession } from '@/libs/auth';
import StaffRolePage from '@/libs/components/dashboard/StaffRolePage';
import StaffProfileCard from '@/libs/components/dashboard/StaffProfileCard';
import { DoctorProfile } from '@/libs/components/dashboard/staffTypes';
import Icon from '@/libs/components/common/Icon';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useTranslation } from '@/libs/i18n/useTranslation';

const PHONE = /^(?:\+?[1-9]\d{7,14}|0\d{1,2}-?\d{3,4}-?\d{4})$/;

export default function DoctorProfilePage() {
  const t = useTranslation();
  const session = useReactiveVar(userVar);
  const client = useApolloClient();
  const [editing, setEditing] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [formError, setFormError] = useState('');
  const { data, loading, error, refetch } = useQuery<{ getMyDoctorProfile: DoctorProfile }>(GET_DOCTOR_PROFILE, {
    skip: !session._id || session.memberType !== MemberType.DOCTOR, fetchPolicy: 'network-only',
  });
  const [updateProfile, updateState] = useMutation<{ updateMyDoctorProfile: DoctorProfile }>(UPDATE_DOCTOR_PROFILE);
  const doctor = data?.getMyDoctorProfile;
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setFeedback(''); setFormError('');
    const values = new FormData(event.currentTarget);
    const input = Object.fromEntries(['docFullName', 'docPhone', 'docMail', 'docAddress', 'docDesc'].map((key) => [key, String(values.get(key) ?? '').trim()]));
    if (!PHONE.test(input.docPhone)) { setFormError(t('patient.phoneError')); return; }
    try {
      const { data: result } = await updateProfile({ variables: { input } });
      const updated = result?.updateMyDoctorProfile;
      if (!updated) throw new Error(t('admin.actionError'));
      if (userVar()._id !== session._id || userVar().memberType !== MemberType.DOCTOR) return;
      refreshMemberSession({ _id: updated._id, memberType: updated.memberType, memberNick: updated.docNick, memberFullName: updated.docFullName, memberImage: updated.docImage, accessToken: updated.accessToken });
      client.writeQuery({ query: GET_DOCTOR_PROFILE, data: { getMyDoctorProfile: updated } });
      setEditing(false); setFeedback(t('admin.saved'));
    } catch (requestError: any) { setFormError(requestError?.message ?? t('admin.actionError')); }
  };

  return <StaffRolePage role={MemberType.DOCTOR} titleKey="dashboard.profileLink" introKey="staff.profileIntro">
    {loading && <p className="clinical-staff-state">{t('dashboard.loading')}</p>}
    {error && <div className="clinical-staff-state"><p className="clinical-form-error" role="alert">{t('admin.loadError')}</p><button type="button" className="clinical-secondary-button" onClick={() => void refetch().catch(() => {})}>{t('patient.retry')}</button></div>}
    {doctor && <>
      <StaffProfileCard name={doctor.docFullName || doctor.docNick} nickname={doctor.docNick} image={doctor.docImage} facts={[
        { label: t('admin.phone'), value: doctor.docPhone }, { label: t('admin.email'), value: doctor.docMail || '—' },
        { label: t('admin.room'), value: doctor.docRoom }, { label: t('admin.experience'), value: doctor.docExperience },
        { label: t('staff.address'), value: doctor.docAddress || '—' }, { label: t('staff.description'), value: doctor.docDesc || '—' },
      ]}><button type="button" disabled={editing} onClick={() => { setEditing(true); setFeedback(''); setFormError(''); }}><Icon name="edit" />{t('staff.editProfile')}</button></StaffProfileCard>
      {editing && <section className="clinical-staff-panel"><header><h2>{t('staff.contactDetails')}</h2></header><form className="clinical-staff-form clinical-staff-profile-form" onSubmit={(event) => void submit(event)}>
        <label>{t('admin.nickname')}<input value={doctor.docNick} disabled /></label>
        <label>{t('admin.name')}<input name="docFullName" defaultValue={doctor.docFullName} minLength={2} maxLength={100} required autoComplete="name" /></label>
        <label>{t('admin.phone')}<input name="docPhone" type="tel" defaultValue={doctor.docPhone} required autoComplete="tel" /></label>
        <label>{t('admin.email')}<input name="docMail" type="email" defaultValue={doctor.docMail || ''} autoComplete="email" /></label>
        <label>{t('staff.address')}<input name="docAddress" defaultValue={doctor.docAddress || ''} maxLength={300} autoComplete="street-address" /></label>
        <label>{t('staff.description')}<textarea name="docDesc" defaultValue={doctor.docDesc || ''} maxLength={2000} /></label>
        <div className="clinical-staff-profile-buttons"><button type="submit" disabled={updateState.loading}>{t(updateState.loading ? 'patient.saving' : 'patient.saveChanges')}</button><button type="button" disabled={updateState.loading} onClick={() => { setEditing(false); setFormError(''); }}>{t('patient.cancel')}</button></div>
      </form></section>}
    </>}
    {feedback && <p className="clinical-admin-feedback" role="status">{feedback}</p>}
    {formError && <p className="clinical-form-error" role="alert">{formError}</p>}
  </StaffRolePage>;
}
