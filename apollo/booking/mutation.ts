import { gql } from '@apollo/client';

export const ADD_CART_ITEM = gql`
	mutation AddCartItem($input: CartItemInput!) {
		addCartItem(input: $input) {
			_id
			serviceId
			doctorId
			requestedStartAt
		}
	}
`;

export const CREATE_BOOKING_ORDER = gql`
	mutation CreateBookingOrder {
		createBookingOrder {
			_id
			orderCode
			bookingOrderStatus
			bookingOrderTotalAmount
			bookingOrderCurrency
		}
	}
`;
