import { useQuery } from '@apollo/client';
import { useRouter } from 'next/router';
import Link from 'next/link';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import { GET_MEMBER } from '@/apollo/member/query';
import { Member } from '@/libs/components/member/types/member';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import FollowButton from '@/libs/components/follow/FollowButton';
import FollowLists from '@/libs/components/follow/FollowLists';
import { resolveApiAsset } from '@/libs/config';
import { useTranslation } from '@/libs/i18n/useTranslation';

const PatientPage = () => {
	const t = useTranslation();
	const router = useRouter();
	const memberId = typeof router.query.memberId === 'string' ? router.query.memberId : '';
	const { data, loading, error, refetch } = useQuery<{ getMember: Member }>(GET_MEMBER, { variables: { memberId }, skip: !/^[a-f\d]{24}$/i.test(memberId), fetchPolicy: 'cache-and-network' });
	const patient = data?.getMember?.memberType === MemberType.PATIENT ? data.getMember : null;
	const name = patient?.memberFullName || patient?.memberNick || t('publicPatient.nameFallback');
	return <div className="clinical-inner-page"><section className="clinical-inner-hero"><div className="clinical-crumb"><Link href="/">{t('nav.home')}</Link> / {t('publicPatient.profile')}</div><span className="clinical-eyebrow">{t('publicPatient.community')}</span><h1>{loading && !patient ? t('publicPatient.loading') : patient ? name : t('publicPatient.unavailable')}</h1><p>{patient?.memberDesc || t('publicPatient.intro')}</p></section>{patient ? <><section className="clinical-inner-section clinical-public-profile"><span className="clinical-profile-large" style={patient.memberImage ? { backgroundImage: `url(${resolveApiAsset(patient.memberImage)})` } : undefined}>{patient.memberImage ? null : name.slice(0, 2).toUpperCase()}</span><div><h2>{name}</h2><p>{patient.memberFollowers ?? 0} {t('follow.followers')} · {patient.memberFollowings ?? 0} {t('follow.following')}</p><FollowButton targetId={patient._id} kind="member" initialFollowing={Boolean(patient.meFollowed?.[0]?.myFollowing)} onChanged={refetch} /></div></section><FollowLists profileId={patient._id} kind="patient" /></> : !loading && <p className="clinical-query-status">{error ? t('publicPatient.loadError') : t('publicPatient.notFound')}</p>}</div>;
};

export default withLayoutMain(PatientPage);
