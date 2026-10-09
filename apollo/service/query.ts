import { gql } from '@apollo/client';

export const GET_SERVICES = gql`
	query GetServices($input: ServicesInquiry!) {
		getServices(input: $input) {
			list {
				_id
				memberId
				serviceName
				serviceType
				serviceStatus
				serviceRoomName
				serviceTitle
				servicePrice serviceDiscountPercent
				serviceViews
				serviceLikes
				serviceRank
				serviceImages
				serviceDesc
				serviceDuration
				memberData { _id docFullName docSpecialty docImage docExperience docPoints }
				meLiked { memberId likeRefId myFavorite }
			}
			metaCounter { total }
		}
	}
`;

export const GET_SERVICE = gql`
	query GetService($serviceId: String!) {
		getService(serviceId: $serviceId) {
			_id serviceName departmentId serviceType serviceStatus serviceRoomName serviceRoom serviceTitle servicePrice serviceDiscountPercent
			serviceViews serviceLikes serviceComments serviceRank serviceImages serviceDesc serviceDuration memberId
			memberData { _id memberStatus docFullName docSpecialty docImage docExperience docPoints docPatients }
			meLiked { memberId likeRefId myFavorite }
		}
	}
`;

export const GET_RECOMMENDED_SERVICES = gql`
	query GetRecommendedServices($serviceId: String!, $limit: Int) {
		getRecommendedServices(serviceId: $serviceId, limit: $limit) {
			list { _id serviceTitle servicePrice serviceDiscountPercent serviceImages serviceType serviceDesc serviceLikes serviceViews }
			metaCounter { total }
		}
	}
`;

export const GET_VISITED_SERVICES = gql`
	query GetVisitedServices($input: OrdinaryInquiry!) {
		getVisited(input: $input) {
			list { _id serviceTitle serviceDesc serviceType serviceImages }
			metaCounter { total }
		}
	}
`;

export const GET_FAVORITE_SERVICES = gql`
	query GetFavoriteServices($input: OrdinaryInquiry!) {
		getFavorites(input: $input) {
			list { _id serviceTitle serviceDesc serviceType serviceImages }
			metaCounter { total }
		}
	}
`;

export const GET_SERVICE_BOOKING_OPTIONS = gql`
 query GetServiceBookingOptions($input: ServicesInquiry!) {
  getServices(input: $input) {
   list { _id memberId departmentId serviceType serviceStatus serviceTitle serviceName servicePrice serviceDiscountPercent serviceDuration
    memberData { _id memberStatus } }
   metaCounter { total }
  }
 }
`;
