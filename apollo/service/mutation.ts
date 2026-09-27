import { gql } from '@apollo/client';

export const LIKE_TARGET_SERVICE = gql`
	mutation LikeTargetService($serviceId: String!) {
		likeTargetService(serviceId: $serviceId) { _id serviceLikes serviceViews serviceComments meLiked { memberId likeRefId myFavorite } }
	}
`;
