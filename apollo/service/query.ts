import { gql } from '@apollo/client';

export const GET_SERVICES = gql`
	query GetServices($input: ServicesInquiry!) {
		getServices(input: $input) {
			list {
				_id
				serviceName
				serviceType
				serviceStatus
				serviceRoomName
				serviceTitle
				servicePrice
				serviceViews
				serviceLikes
				serviceRank
				serviceImages
				serviceDesc
				serviceDuration
			}
			metaCounter { total }
		}
	}
`;

export const GET_SERVICE = gql`
	query GetService($serviceId: String!) {
		getService(serviceId: $serviceId) {
			_id serviceName departmentId serviceType serviceStatus serviceRoomName serviceRoom serviceTitle servicePrice
			serviceViews serviceLikes serviceComments serviceRank serviceImages serviceDesc serviceDuration memberId
			memberData { _id docFullName docSpecialty docImage docExperience docPoints docPatients }
		}
	}
`;

export const GET_RECOMMENDED_SERVICES = gql`
	query GetRecommendedServices($serviceId: String!, $limit: Int) {
		getRecommendedServices(serviceId: $serviceId, limit: $limit) {
			list { _id serviceTitle servicePrice serviceImages serviceType serviceDesc serviceLikes serviceViews }
			metaCounter { total }
		}
	}
`;
