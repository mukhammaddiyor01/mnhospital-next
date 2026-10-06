import Link from 'next/link';
import { useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { GET_DOCTOR } from '@/apollo/doctor/query';
import StaffRolePage from '@/libs/components/dashboard/StaffRolePage';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useTranslation } from '@/libs/i18n/useTranslation';

interface Profile { docNick: string; docFullName?: string; docSpecialty?: string; docRoom?: string; docExperience?: number; docAddress?: string; docDesc?: string }

export default function DoctorProfile() {
  const t = useTranslation();
  const session = useReactiveVar(userVar);
  const { data, loading, error } = useQuery<{ getDoctor: Profile }>(GET_DOCTOR, {
    variables: { doctorId: session._id }, skip: !session._id || session.memberType !== MemberType.DOCTOR, fetchPolicy: 'network-only',
  });
  const doctor = data?.getDoctor;
  return <StaffRolePage role={MemberType.DOCTOR} titleKey="dashboard.profileLink" introKey="staff.profileIntro">
    <section className="clinical-staff-panel clinical-admin-resource"><header><h2>{t('dashboard.profileLink')}</h2></header>
      {loading && <p className="clinical-staff-state">{t('dashboard.loading')}</p>}
      {error && <p className="clinical-staff-state clinical-form-error" role="alert">{t('admin.loadError')}</p>}
      {doctor && <div className="clinical-staff-profile-details"><div><small>{t('admin.name')}</small><strong>{doctor.docFullName || doctor.docNick}</strong></div><div><small>{t('admin.nickname')}</small><strong>{doctor.docNick}</strong></div><div><small>{t('admin.room')}</small><strong>{doctor.docRoom || '—'}</strong></div><div><small>{t('admin.experience')}</small><strong>{doctor.docExperience ?? 0}</strong></div><div><small>{t('staff.address')}</small><strong>{doctor.docAddress || '—'}</strong></div><div><small>{t('staff.description')}</small><strong>{doctor.docDesc || '—'}</strong></div></div>}
      <Link className="clinical-admin-workspace-link" href={`/doctor/${session._id}`}>{t('patient.openDoctor')}</Link>
    </section>
  </StaffRolePage>;
}
