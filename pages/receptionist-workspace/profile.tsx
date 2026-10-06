import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { GET_RECEPTIONIST_PROFILE } from '@/apollo/staff-workspace/query';
import { UPDATE_RECEPTIONIST_PROFILE } from '@/apollo/staff-workspace/mutation';
import StaffRolePage from '@/libs/components/dashboard/StaffRolePage';
import { ReceptionistProfile } from '@/libs/components/dashboard/staffTypes';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useTranslation } from '@/libs/i18n/useTranslation';

type FormFields = Pick<ReceptionistProfile, 'receptionistFullName' | 'receptionistPhone' | 'receptionistMail'> & { receptionistAddress: string; receptionistDesc: string };
const empty: FormFields = { receptionistFullName: '', receptionistPhone: '', receptionistMail: '', receptionistAddress: '', receptionistDesc: '' };
const PHONE = /^(?:\+?[1-9]\d{7,14}|0\d{1,2}-?\d{3,4}-?\d{4})$/;

export default function ReceptionistProfilePage() {
  const t = useTranslation();
  const session = useReactiveVar(userVar);
  const [form, setForm] = useState<FormFields>(empty);
  const [feedback, setFeedback] = useState('');
  const { data, loading, error, refetch } = useQuery<{ getMyReceptionistProfile: ReceptionistProfile }>(GET_RECEPTIONIST_PROFILE, {
    skip: !session._id || session.memberType !== MemberType.RECEPTIONIST, fetchPolicy: 'network-only',
  });
  const [updateProfile, updateState] = useMutation(UPDATE_RECEPTIONIST_PROFILE);
  const profile = data?.getMyReceptionistProfile;
  useEffect(() => { if (profile) setForm({ receptionistFullName: profile.receptionistFullName, receptionistPhone: profile.receptionistPhone, receptionistMail: profile.receptionistMail, receptionistAddress: profile.receptionistAddress || '', receptionistDesc: profile.receptionistDesc || '' }); }, [profile]);
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setFeedback('');
    const input = Object.fromEntries(Object.entries(form).map(([key, value]) => [key, value.trim()]));
    if (!PHONE.test(input.receptionistPhone) || !input.receptionistFullName || !input.receptionistMail) { setFeedback(t('admin.actionError')); return; }
    try {
      const result = await updateProfile({ variables: { input } });
      const updatedName = result.data?.updateMyReceptionistProfile?.receptionistFullName;
      if (updatedName) userVar({ ...userVar(), memberFullName: updatedName });
      await refetch(); setFeedback(t('admin.saved'));
    } catch (requestError: any) { setFeedback(requestError?.message ?? t('admin.actionError')); }
  };
  return <StaffRolePage role={MemberType.RECEPTIONIST} titleKey="dashboard.profileLink" introKey="staff.profileIntro">
    <section className="clinical-staff-panel clinical-admin-resource"><header><h2>{t('dashboard.profileLink')}</h2></header>
      {loading && <p className="clinical-staff-state">{t('dashboard.loading')}</p>}
      {error && <p className="clinical-staff-state clinical-form-error" role="alert">{t('admin.loadError')}</p>}
      {profile && <form className="clinical-staff-form" onSubmit={(event) => void submit(event)}>
        <label>{t('admin.nickname')}<input value={profile.receptionistNick} disabled /></label>
        <label>{t('admin.name')}<input value={form.receptionistFullName} minLength={2} maxLength={100} required onChange={(event) => setForm({ ...form, receptionistFullName: event.target.value })} /></label>
        <label>{t('admin.phone')}<input type="tel" value={form.receptionistPhone} required onChange={(event) => setForm({ ...form, receptionistPhone: event.target.value })} /></label>
        <label>{t('admin.email')}<input type="email" value={form.receptionistMail} required onChange={(event) => setForm({ ...form, receptionistMail: event.target.value })} /></label>
        <label>{t('staff.address')}<input value={form.receptionistAddress} onChange={(event) => setForm({ ...form, receptionistAddress: event.target.value })} /></label>
        <label>{t('staff.description')}<textarea value={form.receptionistDesc} onChange={(event) => setForm({ ...form, receptionistDesc: event.target.value })} /></label>
        <button type="submit" disabled={updateState.loading}>{t('admin.save')}</button>
      </form>}
      {feedback && <p className="clinical-admin-feedback" role="status">{feedback}</p>}
    </section>
  </StaffRolePage>;
}
