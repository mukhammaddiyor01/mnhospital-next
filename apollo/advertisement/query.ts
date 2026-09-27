import { gql } from '@apollo/client';

export const GET_ADVERTISEMENTS = gql`
	query GetAdvertisements($input: AdvertisementsInquiry!) {
		getAdvertisements(input: $input) {
			list { _id advertisementStatus advertisementTitle advertisementContent advertisementImage advertisementLink createdAt updatedAt }
			metaCounter { total }
		}
	}
`;
