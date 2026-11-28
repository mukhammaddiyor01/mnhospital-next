import { gql } from '@apollo/client';
export const GET_PROMO_CODES = gql`
	query GetPromoCodesByAdmin($input: PromoCodesInquiry!) {
		getPromoCodesByAdmin(input: $input) {
			list {
				_id
				code
				discountType
				discountValue
				currency
				showOnHomepage
				isActive
				minSubtotal
				startsAt
				expiresAt
				serviceIds
				createdAt
				updatedAt
			}
			metaCounter {
				total
			}
		}
	}
`;
export const CREATE_PROMO_CODE = gql`
	mutation CreatePromoCodeByAdmin($input: PromoCodeInput!) {
		createPromoCodeByAdmin(input: $input) {
			_id
		}
	}
`;
export const UPDATE_PROMO_CODE = gql`
	mutation UpdatePromoCodeByAdmin($input: PromoCodeUpdate!) {
		updatePromoCodeByAdmin(input: $input) {
			_id
		}
	}
`;
export const REMOVE_PROMO_CODE = gql`
	mutation RemovePromoCodeByAdmin($promoCodeId: String!) {
		removePromoCodeByAdmin(promoCodeId: $promoCodeId) {
			_id
		}
	}
`;
export const APPLY_BOOKING_PROMO = gql`
	mutation ApplyBookingPromoCode($input: BookingPromoInput!) {
		applyBookingPromoCode(input: $input) {
			_id
			promoCode
			bookingOrderTotalAmount
			bookingOrderDiscountAmount
			serviceDiscountAmount
			promoDiscountAmount
		}
	}
`;
export const SET_SERVICE_DISCOUNT = gql`
	mutation SetServiceDiscountByAdmin($input: ServiceDiscountInput!) {
		setServiceDiscountByAdmin(input: $input) {
			_id
			serviceDiscountPercent
		}
	}
`;
export const ADMIN_DISCOUNT_SERVICES = gql`
	mutation AdminDiscountServices($input: ServicesInquiry!) {
		getAllServicesByAdmin(input: $input) {
			list {
				_id
				serviceTitle
				serviceName
				servicePrice
				serviceDiscountPercent
				serviceStatus
				serviceImages
			}
			metaCounter {
				total
			}
		}
	}
`;

export const GET_PUBLIC_PROMO_OFFERS = gql`
 query GetPublicPromoOffers {
  getPublicPromoOffers { _id code discountType discountValue currency minSubtotal serviceIds expiresAt }
 }
`;
