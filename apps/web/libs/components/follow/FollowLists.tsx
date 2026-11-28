import Link from 'next/link';
import { useEffect, useId, useRef, useState } from 'react';
import { useQuery } from '@apollo/client';
import { GET_DOCTOR_FOLLOWERS, GET_DOCTOR_FOLLOWINGS, GET_MEMBER_FOLLOWERS, GET_MEMBER_FOLLOWINGS } from '@/apollo/follow/query';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { usePreferences } from '../preference/PreferenceProvider';
import { resolveApiAsset } from '@/libs/config';
import Icon from '../common/Icon';

type Person = { _id: string; kind: 'patient' | 'doctor'; name: string; image?: string; href: string };
type MemberInfo = { _id: string; memberNick: string; memberFullName?: string; memberImage?: string };
type DoctorInfo = { _id: string; docFullName: string; docImage?: string };
type MemberFollower = { followerData?: MemberInfo; followerDoctorData?: DoctorInfo };
type DoctorFollower = { memberData?: MemberInfo; followerDoctorData?: DoctorInfo };
type MemberFollowing = { followingData?: MemberInfo };
type DoctorFollowing = { doctorData?: DoctorInfo };
type Page<T> = { list: T[]; metaCounter?: { total: number }[] };

const asMember = (member?: MemberInfo): Person | null => member ? { _id: member._id, kind: 'patient', name: member.memberFullName || member.memberNick, image: member.memberImage, href: `/patient/${member._id}` } : null;
const asDoctor = (doctor?: DoctorInfo): Person | null => doctor ? { _id: doctor._id, kind: 'doctor', name: doctor.docFullName, image: doctor.docImage, href: `/doctor/${doctor._id}` } : null;
const isPerson = (person: Person | null): person is Person => person !== null;
// Empty aggregates have no metaCounter entry. Missing query data is unknown,
// not zero: a failure must not present a misleading relationship count.
const total = (page?: Page<unknown>): number | undefined => page ? page.metaCounter?.[0]?.total ?? 0 : undefined;

const PersonAvatar = ({ person }: { person: Person }) => {
	const [failed, setFailed] = useState(false);
	return <span className="mn-follow-avatar">
		{person.image && !failed ? <img src={resolveApiAsset(person.image)} alt="" width={48} height={48} loading="lazy" onError={() => setFailed(true)} /> : <span aria-hidden="true">{person.name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase() || <Icon name="person" />}</span>}
	</span>;
};

const FollowOverview = ({ profileId, kind }: { profileId: string; kind: 'doctor' | 'patient' }) => {
	const t = useTranslation();
	const { language } = usePreferences();
	const locale = language === 'KR' ? 'ko-KR' : language === 'UZ' ? 'uz-UZ' : 'en-US';
	const [followerLimit, setFollowerLimit] = useState(20);
	const [followingLimit, setFollowingLimit] = useState(20);
	const [active, setActive] = useState<'followers' | 'following' | null>(null);
	const dialog = useRef<HTMLDialogElement>(null);
	const dialogId = useId();
	const titleId = useId();
	const validId = /^[a-f\d]{24}$/i.test(profileId);
	const memberFollowers = useQuery<{ getMemberFollowers: Page<MemberFollower> }>(GET_MEMBER_FOLLOWERS, { variables: { input: { page: 1, limit: followerLimit, search: { followingId: profileId } } }, skip: !validId || kind !== 'patient', fetchPolicy: 'cache-and-network', notifyOnNetworkStatusChange: true });
	const doctorFollowers = useQuery<{ getDoctorFollowers: Page<DoctorFollower> }>(GET_DOCTOR_FOLLOWERS, { variables: { input: { page: 1, limit: followerLimit, search: { doctorId: profileId } } }, skip: !validId || kind !== 'doctor', fetchPolicy: 'cache-and-network', notifyOnNetworkStatusChange: true });
	const memberFollowings = useQuery<{ getMemberFollowings: Page<MemberFollowing> }>(GET_MEMBER_FOLLOWINGS, { variables: { input: { page: 1, limit: followingLimit, search: { followerId: profileId } } }, skip: !validId, fetchPolicy: 'cache-and-network', notifyOnNetworkStatusChange: true });
	const doctorFollowings = useQuery<{ getDoctorFollowings: Page<DoctorFollowing> }>(GET_DOCTOR_FOLLOWINGS, { variables: { input: { page: 1, limit: followingLimit, search: { memberId: profileId } } }, skip: !validId, fetchPolicy: 'cache-and-network', notifyOnNetworkStatusChange: true });
	// Preserve the loaded rows/counts if the next page fails. The keyed owner
	// wrapper prevents previousData from crossing a profile/role change.
	const memberFollowerPage = (memberFollowers.data ?? memberFollowers.previousData)?.getMemberFollowers;
	const doctorFollowerPage = (doctorFollowers.data ?? doctorFollowers.previousData)?.getDoctorFollowers;
	const memberFollowingPage = (memberFollowings.data ?? memberFollowings.previousData)?.getMemberFollowings;
	const doctorFollowingPage = (doctorFollowings.data ?? doctorFollowings.previousData)?.getDoctorFollowings;
	const followers = (kind === 'doctor' ? (doctorFollowerPage?.list ?? []).map((item) => asMember(item.memberData) ?? asDoctor(item.followerDoctorData)) : (memberFollowerPage?.list ?? []).map((item) => asMember(item.followerData) ?? asDoctor(item.followerDoctorData))).filter(isPerson);
	const followings = [...(memberFollowingPage?.list ?? []).map((item) => asMember(item.followingData)), ...(doctorFollowingPage?.list ?? []).map((item) => asDoctor(item.doctorData))].filter(isPerson);
	const followerQuery = kind === 'doctor' ? doctorFollowers : memberFollowers;
	const followerTotal = total(kind === 'doctor' ? doctorFollowerPage : memberFollowerPage);
	const memberFollowingTotal = total(memberFollowingPage);
	const doctorFollowingTotal = total(doctorFollowingPage);
	const followingTotal = memberFollowingTotal !== undefined && doctorFollowingTotal !== undefined ? memberFollowingTotal + doctorFollowingTotal : undefined;
	const showingFollowers = active === 'followers';
	const people = showingFollowers ? followers : followings;
	const count = showingFollowers ? followerTotal : followingTotal;
	const loading = showingFollowers ? followerQuery.loading : memberFollowings.loading || doctorFollowings.loading;
	const error = showingFollowers ? followerQuery.error : memberFollowings.error || doctorFollowings.error;
	// Use raw relation totals, not the number of resolvable profiles, for paging.
	const hasMore = showingFollowers ? (followerTotal ?? 0) > followerLimit : (memberFollowingTotal ?? 0) > followingLimit || (doctorFollowingTotal ?? 0) > followingLimit;
	useEffect(() => {
		const element = dialog.current;
		if (!element) return;
		if (active && !element.open) element.showModal();
		if (!active && element.open) element.close();
		return () => { if (element.open) element.close(); };
	}, [active]);
	const retry = () => {
		const requests = showingFollowers ? [followerQuery.refetch()] : [memberFollowings.refetch(), doctorFollowings.refetch()];
		void Promise.allSettled(requests);
	};
	return <section className="mn-follow-overview">
		<div className="mn-follow-counts">
			{(['followers', 'following'] as const).map((tab) => <button key={tab} type="button" disabled={!validId} aria-haspopup="dialog" aria-controls={dialogId} onClick={() => setActive(tab)}>
				<strong>{(tab === 'followers' ? followerTotal : followingTotal)?.toLocaleString(locale) ?? '—'}</strong><span>{t(tab === 'followers' ? 'follow.followers' : 'follow.following')}</span>
			</button>)}
		</div>
		<dialog ref={dialog} id={dialogId} className="mn-follow-dialog" aria-labelledby={titleId} onCancel={() => setActive(null)} onClose={() => setActive(null)} onClick={(event) => { if (event.target === event.currentTarget) { const bounds = event.currentTarget.getBoundingClientRect(); if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) setActive(null); } }}>
			<header><h2 id={titleId}>{t(showingFollowers ? 'follow.followers' : 'follow.following')} <small>{count?.toLocaleString(locale) ?? '—'}</small></h2><button type="button" autoFocus aria-label={t('follow.closeList')} onClick={() => setActive(null)}><Icon name="close" /></button></header>
			<div className="mn-follow-dialog-content" aria-busy={loading}>
				{active && people.length > 0 ? <ul>{people.map((person) => <li key={`${person.kind}:${person._id}`}><Link href={person.href} onClick={() => setActive(null)}><PersonAvatar key={person.image} person={person} /><span>{person.name}</span><Icon name="chevron_right" /></Link></li>)}</ul> : !loading && !error ? <p>{t(showingFollowers ? 'follow.noFollowers' : 'follow.noFollowing')}</p> : null}
				{loading ? <p role="status">{t(showingFollowers ? 'follow.loadingFollowers' : 'follow.loadingFollowing')}</p> : null}
				{error ? <div className="mn-follow-error"><p role="alert">{t(showingFollowers ? 'follow.followersUnavailable' : 'follow.followingUnavailable')}</p><button type="button" disabled={loading} onClick={retry}>{t('patient.retry')}</button></div> : null}
				{hasMore ? <button className="mn-follow-more" type="button" disabled={loading} onClick={() => showingFollowers ? setFollowerLimit((limit) => limit + 20) : setFollowingLimit((limit) => limit + 20)}>{t(showingFollowers ? 'follow.moreFollowers' : 'follow.moreFollowing')}</button> : null}
			</div>
		</dialog>
	</section>;
};

const FollowLists = (props: { profileId: string; kind: 'doctor' | 'patient' }) => <FollowOverview key={`${props.kind}:${props.profileId}`} {...props} />;
export default FollowLists;
