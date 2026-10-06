import Link from 'next/link';
import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_DOCTOR_FOLLOWERS, GET_DOCTOR_FOLLOWINGS, GET_MEMBER_FOLLOWERS, GET_MEMBER_FOLLOWINGS } from '@/apollo/follow/query';
import { useTranslation } from '@/libs/i18n/useTranslation';

type Person = { _id: string; name: string; href: string };
type MemberInfo = { _id: string; memberNick: string; memberFullName?: string };
type DoctorInfo = { _id: string; docFullName: string };
type MemberFollower = { followerData?: MemberInfo; followerDoctorData?: DoctorInfo };
type DoctorFollower = { memberData?: MemberInfo; followerDoctorData?: DoctorInfo };
type MemberFollowing = { followingData?: MemberInfo };
type DoctorFollowing = { doctorData?: DoctorInfo };

const asMember = (member?: MemberInfo): Person | null => member ? { _id: member._id, name: member.memberFullName || member.memberNick, href: `/patient/${member._id}` } : null;
const asDoctor = (doctor?: DoctorInfo): Person | null => doctor ? { _id: doctor._id, name: doctor.docFullName, href: `/doctor/${doctor._id}` } : null;

const FollowLists = ({ profileId, kind }: { profileId: string; kind: 'doctor' | 'patient' }) => {
	const t = useTranslation();
	const [followerLimit, setFollowerLimit] = useState(50);
	const [followingLimit, setFollowingLimit] = useState(50);
	const validId = /^[a-f\d]{24}$/i.test(profileId);
	const memberFollowers = useQuery(GET_MEMBER_FOLLOWERS, { variables: { input: { page: 1, limit: followerLimit, search: { followingId: profileId } } }, skip: !validId || kind !== 'patient' });
	const doctorFollowers = useQuery(GET_DOCTOR_FOLLOWERS, { variables: { input: { page: 1, limit: followerLimit, search: { doctorId: profileId } } }, skip: !validId || kind !== 'doctor' });
	const memberFollowings = useQuery(GET_MEMBER_FOLLOWINGS, { variables: { input: { page: 1, limit: followingLimit, search: { followerId: profileId } } }, skip: !validId });
	const doctorFollowings = useQuery(GET_DOCTOR_FOLLOWINGS, { variables: { input: { page: 1, limit: followingLimit, search: { memberId: profileId } } }, skip: !validId });
	const followers = kind === 'doctor' ? (doctorFollowers.data?.getDoctorFollowers?.list ?? []).map((item: DoctorFollower) => asMember(item.memberData) ?? asDoctor(item.followerDoctorData)) : (memberFollowers.data?.getMemberFollowers?.list ?? []).map((item: MemberFollower) => asMember(item.followerData) ?? asDoctor(item.followerDoctorData));
	const followings = [...(memberFollowings.data?.getMemberFollowings?.list ?? []).map((item: MemberFollowing) => asMember(item.followingData)), ...(doctorFollowings.data?.getDoctorFollowings?.list ?? []).map((item: DoctorFollowing) => asDoctor(item.doctorData))];
	const followerQuery = kind === 'doctor' ? doctorFollowers : memberFollowers;
	const followerTotal = kind === 'doctor' ? doctorFollowers.data?.getDoctorFollowers?.metaCounter?.[0]?.total ?? 0 : memberFollowers.data?.getMemberFollowers?.metaCounter?.[0]?.total ?? 0;
	const followingTotal = (memberFollowings.data?.getMemberFollowings?.metaCounter?.[0]?.total ?? 0) + (doctorFollowings.data?.getDoctorFollowings?.metaCounter?.[0]?.total ?? 0);
	return <section className="clinical-follow-grid">
		<div>
			<h2>{t('follow.followers')}</h2>
			{followers.filter(Boolean).length ? <ul>{followers.filter(Boolean).map((person: Person) => <li key={person._id}><Link href={person.href}>{person.name}</Link></li>)}</ul> : <p>{followerQuery.loading ? t('follow.loadingFollowers') : followerQuery.error ? t('follow.followersUnavailable') : t('follow.noFollowers')}</p>}
			{followers.length < followerTotal && <button type="button" onClick={() => setFollowerLimit((limit) => limit + 50)}>{t('follow.moreFollowers')}</button>}
		</div>
		<div>
			<h2>{t('follow.following')}</h2>
			{followings.filter(Boolean).length ? <ul>{followings.filter(Boolean).map((person: Person) => <li key={person._id}><Link href={person.href}>{person.name}</Link></li>)}</ul> : <p>{memberFollowings.loading || doctorFollowings.loading ? t('follow.loadingFollowing') : memberFollowings.error || doctorFollowings.error ? t('follow.followingUnavailable') : t('follow.noFollowing')}</p>}
			{followings.length < followingTotal && <button type="button" onClick={() => setFollowingLimit((limit) => limit + 50)}>{t('follow.moreFollowing')}</button>}
		</div>
	</section>;
};

export default FollowLists;
