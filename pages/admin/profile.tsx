import { useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { GET_MY_ADMIN_PROFILE } from '@/apollo/admin/query';
import AdminWorkspacePage from '@/libs/components/dashboard/AdminWorkspacePage';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { usePreferences } from '@/libs/components/preference/PreferenceProvider';

interface AdminProfile { _id: string; adminNick: string; adminPhone: string; adminMail?: string; adminDesc?: string; createdAt: string }

const AdminProfilePage = () => {
  const t = useTranslation();
  const { language } = usePreferences();
  const session = useReactiveVar(userVar);
  const { data, loading, error } = useQuery<{ getMyAdminProfile: AdminProfile }>(GET_MY_ADMIN_PROFILE, {
    skip: !session._id || session.memberType !== MemberType.ADMIN,
    fetchPolicy: 'network-only',
  });
  const profile = data?.getMyAdminProfile;
  const createdAt = profile?.createdAt ? new Intl.DateTimeFormat({ KR: 'ko-KR', UZ: 'uz-UZ', EN: 'en-US' }[language], { dateStyle: 'medium' }).format(new Date(profile.createdAt)) : '';

  return <AdminWorkspacePage titleKey="dashboard.profileLink" introKey="admin.profileIntro">
    <section className="clinical-staff-panel clinical-admin-detail-panel"><header><h2>{t('admin.profileDetails')}</h2></header>
      {loading && <p className="clinical-staff-state">{t('dashboard.loading')}</p>}
      {error && <p className="clinical-staff-state clinical-form-error" role="alert">{t('admin.loadError')}</p>}
      {profile && <dl><div><dt>{t('admin.nickname')}</dt><dd>{profile.adminNick}</dd></div><div><dt>{t('admin.phone')}</dt><dd>{profile.adminPhone}</dd></div><div><dt>{t('admin.email')}</dt><dd>{profile.adminMail || '—'}</dd></div><div><dt>{t('admin.createdAt')}</dt><dd>{createdAt}</dd></div></dl>}
    </section>
  </AdminWorkspacePage>;
};

export default AdminProfilePage;
