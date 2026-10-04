import { gql } from '@apollo/client';

export const SUBSCRIBE_MEMBER = gql`mutation Subscribe($input: String!) { subscribe(input: $input) { _id followingId followerId } }`;
export const UNSUBSCRIBE_MEMBER = gql`mutation Unsubscribe($input: String!) { unsubscribe(input: $input) { _id followingId followerId } }`;
export const SUBSCRIBE_DOCTOR = gql`mutation SubscribeDoctor($input: String!) { subscribeDoctor(input: $input) { _id doctorId memberId } }`;
export const UNSUBSCRIBE_DOCTOR = gql`mutation UnsubscribeDoctor($input: String!) { unsubscribeDoctor(input: $input) { _id doctorId memberId } }`;
