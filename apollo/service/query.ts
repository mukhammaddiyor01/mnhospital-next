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
