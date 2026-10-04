import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { GET_DOCTOR_FOLLOWERS, GET_DOCTOR_FOLLOWINGS, GET_MEMBER_FOLLOWERS, GET_MEMBER_FOLLOWINGS } from '@/apollo/follow/query';

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
	const validId = /^[a-f\d]{24}$/i.test(profileId);
	const memberFollowers = useQuery(GET_MEMBER_FOLLOWERS, { variables: { input: { page: 1, limit: 50, search: { followingId: profileId } } }, skip: !validId || kind !== 'patient' });
	const doctorFollowers = useQuery(GET_DOCTOR_FOLLOWERS, { variables: { input: { page: 1, limit: 50, search: { doctorId: profileId } } }, skip: !validId || kind !== 'doctor' });
	const memberFollowings = useQuery(GET_MEMBER_FOLLOWINGS, { variables: { input: { page: 1, limit: 50, search: { followerId: profileId } } }, skip: !validId });
	const doctorFollowings = useQuery(GET_DOCTOR_FOLLOWINGS, { variables: { input: { page: 1, limit: 50, search: { memberId: profileId } } }, skip: !validId });
	const followers = kind === 'doctor' ? (doctorFollowers.data?.getDoctorFollowers?.list ?? []).map((item: DoctorFollower) => asMember(item.memberData) ?? asDoctor(item.followerDoctorData)) : (memberFollowers.data?.getMemberFollowers?.list ?? []).map((item: MemberFollower) => asMember(item.followerData) ?? asDoctor(item.followerDoctorData));
	const followings = [...(memberFollowings.data?.getMemberFollowings?.list ?? []).map((item: MemberFollowing) => asMember(item.followingData)), ...(doctorFollowings.data?.getDoctorFollowings?.list ?? []).map((item: DoctorFollowing) => asDoctor(item.doctorData))];
	return <section className="clinical-follow-grid"><div><h2>Followers</h2>{followers.filter(Boolean).length ? <ul>{followers.filter(Boolean).map((person: Person) => <li key={person._id}><Link href={person.href}>{person.name}</Link></li>)}</ul> : <p>No followers yet.</p>}</div><div><h2>Following</h2>{followings.filter(Boolean).length ? <ul>{followings.filter(Boolean).map((person: Person) => <li key={person._id}><Link href={person.href}>{person.name}</Link></li>)}</ul> : <p>Not following anyone yet.</p>}</div></section>;
};

export default FollowLists;
