import { gql } from '@apollo/client';

export const LOGIN_ADMIN = gql`
  mutation LoginAdmin($input: AdminLoginInput!) {
    loginAdmin(input: $input) { _id memberType adminNick adminImage accessToken }
  }
`;

export const LOGIN_RECEPTIONIST = gql`
  mutation LoginReceptionist($input: ReceptionistLoginInput!) {
    loginReceptionist(input: $input) {
      _id memberType receptionistNick receptionistFullName receptionistImage accessToken
    }
  }
`;
