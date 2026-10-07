import { ApolloClient, NormalizedCacheObject } from '@apollo/client';
import { GET_DOCTOR_FOLLOWERS, GET_DOCTOR_FOLLOWINGS, GET_MEMBER_FOLLOWERS, GET_MEMBER_FOLLOWINGS } from '@/apollo/follow/query';

export const refreshFollowViews = async (
	client: Pick<ApolloClient<NormalizedCacheObject>, 'refetchQueries'>,
	kind: 'doctor' | 'member',
	onChanged?: () => Promise<unknown>,
) => {
	await Promise.all([
		client.refetchQueries({
			include: kind === 'doctor'
				? [GET_DOCTOR_FOLLOWERS, GET_DOCTOR_FOLLOWINGS]
				: [GET_MEMBER_FOLLOWERS, GET_MEMBER_FOLLOWINGS],
		}),
		onChanged?.(),
	]);
};
