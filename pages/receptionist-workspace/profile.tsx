import { FormEvent, useState } from 'react';
import { useApolloClient, useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { GET_RECEPTIONIST_PROFILE } from '@/apollo/staff-workspace/query';
import { UPDATE_RECEPTIONIST_PROFILE } from '@/apollo/staff-workspace/mutation';
import { refreshMemberSession } from '@/libs/auth';
import StaffRolePage from '@/libs/components/dashboard/StaffRolePage';
import StaffProfileCard from '@/libs/components/dashboard/StaffProfileCard';
import { ReceptionistProfile } from '@/libs/components/dashboard/staffTypes';
import Icon from '@/libs/components/common/Icon';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useTranslation } from '@/libs/i18n/useTranslation';

const PHONE = /^(?:\+?[1-9]\d{7,14}|0\d{1,2}-?\d{3,4}-?\d{4})$/;

export default function ReceptionistProfilePage() {
  const t = useTranslation();
  const session = useReactiveVar(userVar);
  const client = useApolloClient();
  const [editing, setEditing] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [formError, setFormError] = useState('');
  const { data, loading, error, refetch } = useQuery<{ getMyReceptionistProfile: ReceptionistProfile }>(GET_RECEPTIONIST_PROFILE, {
    skip: !session._id || session.memberType !== MemberType.RECEPTIONIST, fetchPolicy: 'network-only',
  });
  const [updateProfile, updateState] = useMutation<{ updateMyReceptionistProfile: ReceptionistProfile }>(UPDATE_RECEPTIONIST_PROFILE);
  const profile = data?.getMyReceptionistProfile;
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setFeedback(''); setFormError('');
    const values = new FormData(event.currentTarget);
    const input = Object.fromEntries(['receptionistFullName', 'receptionistPhone', 'receptionistMail', 'receptionistAddress', 'receptionistDesc'].map((key) => [key, String(values.get(key) ?? '').trim()]));
    if (!PHONE.test(input.receptionistPhone)) { setFormError(t('patient.phoneError')); return; }
    try {
      const { data: result } = await updateProfile({ variables: { input } });
      const updated = result?.updateMyReceptionistProfile;
      if (!updated) throw new Error(t('admin.actionError'));
      if (userVar()._id !== session._id || userVar().memberType !== MemberType.RECEPTIONIST) return;
      refreshMemberSession({ _id: updated._id, memberType: updated.memberType, memberNick: updated.receptionistNick, memberFullName: updated.receptionistFullName, memberImage: updated.receptionistImage, accessToken: updated.accessToken });
      client.writeQuery({ query: GET_RECEPTIONIST_PROFILE, data: { getMyReceptionistProfile: updated } });
      setEditing(false); setFeedback(t('admin.saved'));
    } catch (requestError: any) { setFormError(requestError?.message ?? t('admin.actionError')); }
  };

  return <StaffRolePage role={MemberType.RECEPTIONIST} titleKey="dashboard.profileLink" introKey="staff.profileIntro">
    {loading && <p className="clinical-staff-state">{t('dashboard.loading')}</p>}
    {error && <div className="clinical-staff-state"><p className="clinical-form-error" role="alert">{t('admin.loadError')}</p><button type="button" className="clinical-secondary-button" onClick={() => void refetch().catch(() => {})}>{t('patient.retry')}</button></div>}
    {profile && <>
      <StaffProfileCard name={profile.receptionistFullName || profile.receptionistNick} nickname={profile.receptionistNick} image={profile.receptionistImage} facts={[
        { label: t('admin.phone'), value: profile.receptionistPhone }, { label: t('admin.email'), value: profile.receptionistMail },
        { label: t('staff.address'), value: profile.receptionistAddress || '—' }, { label: t('staff.description'), value: profile.receptionistDesc || '—' },
      ]}><button type="button" disabled={editing} onClick={() => { setEditing(true); setFeedback(''); setFormError(''); }}><Icon name="edit" />{t('staff.editProfile')}</button></StaffProfileCard>
      {editing && <section className="clinical-staff-panel"><header><h2>{t('staff.contactDetails')}</h2></header><form className="clinical-staff-form clinical-staff-profile-form" onSubmit={(event) => void submit(event)}>
        <label>{t('admin.nickname')}<input value={profile.receptionistNick} disabled /></label>
        <label>{t('admin.name')}<input name="receptionistFullName" defaultValue={profile.receptionistFullName} minLength={2} maxLength={100} required autoComplete="name" /></label>
        <label>{t('admin.phone')}<input name="receptionistPhone" type="tel" defaultValue={profile.receptionistPhone} required autoComplete="tel" /></label>
        <label>{t('admin.email')}<input name="receptionistMail" type="email" defaultValue={profile.receptionistMail} required autoComplete="email" /></label>
        <label>{t('staff.address')}<input name="receptionistAddress" defaultValue={profile.receptionistAddress || ''} autoComplete="street-address" /></label>
        <label>{t('staff.description')}<textarea name="receptionistDesc" defaultValue={profile.receptionistDesc || ''} /></label>
        <div className="clinical-staff-profile-buttons"><button type="submit" disabled={updateState.loading}>{t(updateState.loading ? 'patient.saving' : 'patient.saveChanges')}</button><button type="button" disabled={updateState.loading} onClick={() => { setEditing(false); setFormError(''); }}>{t('patient.cancel')}</button></div>
      </form></section>}
    </>}
    {feedback && <p className="clinical-admin-feedback" role="status">{feedback}</p>}
    {formError && <p className="clinical-form-error" role="alert">{formError}</p>}
  </StaffRolePage>;
}
