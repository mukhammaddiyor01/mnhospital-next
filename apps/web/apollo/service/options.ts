import { gql } from '@apollo/client';
export const ADMIN_OPTION_SERVICES = gql`
	mutation AdminOptionServices($input: ServicesInquiry!) {
		getAllServicesByAdmin(input: $input) {
			list {
				_id
				memberId
				departmentId
				serviceType
				serviceRoom
				serviceStatus
				serviceTitle
				serviceName
				servicePrice
				serviceDiscountPercent
				serviceDuration
				packageBaseServiceId
				packageRegularPrice
				packageItems {
					serviceId
					title
					price
					duration
				}
				serviceDesc
				memberData {
					_id
					memberStatus
					docFullName
					docNick
				}
			}
			metaCounter {
				total
			}
		}
	}
`;
export const CREATE_SERVICE_OPTION = gql`
	mutation CreateServiceOptionByAdmin($input: ServiceOptionInput!) {
		createServiceOptionByAdmin(input: $input) {
			_id
		}
	}
`;
export const UPDATE_SERVICE_OPTION = gql`
	mutation UpdateServiceOption($input: ServiceOptionUpdateInput!) {
		updateServiceOptionByAdmin(input: $input) {
			_id
		}
	}
`;
