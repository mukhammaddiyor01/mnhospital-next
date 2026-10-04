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

const PatientPage = () => {
	const router = useRouter();
	const memberId = typeof router.query.memberId === 'string' ? router.query.memberId : '';
	const { data, loading, error, refetch } = useQuery<{ getMember: Member }>(GET_MEMBER, { variables: { memberId }, skip: !/^[a-f\d]{24}$/i.test(memberId), fetchPolicy: 'cache-and-network' });
	const patient = data?.getMember?.memberType === MemberType.PATIENT ? data.getMember : null;
	const name = patient?.memberFullName || patient?.memberNick || 'Patient';
	return <div className="clinical-inner-page"><section className="clinical-inner-hero"><div className="clinical-crumb"><Link href="/">Home</Link> / Patient profile</div><span className="clinical-eyebrow">MN HOSPITAL COMMUNITY</span><h1>{loading && !patient ? 'Loading patient…' : patient ? name : 'Patient profile unavailable'}</h1><p>{patient?.memberDesc || 'Connect with the MN Hospital community.'}</p></section>{patient ? <><section className="clinical-inner-section clinical-public-profile"><span className="clinical-profile-large" style={patient.memberImage ? { backgroundImage: `url(${resolveApiAsset(patient.memberImage)})` } : undefined}>{patient.memberImage ? null : name.slice(0, 2).toUpperCase()}</span><div><h2>{name}</h2><p>{patient.memberFollowers ?? 0} followers · {patient.memberFollowings ?? 0} following</p><FollowButton targetId={patient._id} kind="member" initialFollowing={Boolean(patient.meFollowed?.[0]?.myFollowing)} onChanged={refetch} /></div></section><FollowLists profileId={patient._id} kind="patient" /></> : !loading && <p className="clinical-query-status">{error ? 'Unable to load this profile.' : 'No patient profile found.'}</p>}</div>;
};

export default withLayoutMain(PatientPage);
