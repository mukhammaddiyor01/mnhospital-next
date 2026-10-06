import { gql } from '@apollo/client';

export const GET_MY_ADMIN_PROFILE = gql`
  query GetMyAdminWorkspaceProfile {
    getMyAdminProfile { _id adminNick adminPhone adminMail adminImage adminDesc createdAt }
  }
`;

export const GET_ADMIN_DOCTORS = gql`
  query GetAdminWorkspaceDoctors($input: AdminDoctorInquiry!) {
    getDoctorsByAdmin(input: $input) {
      list { _id docNick docFullName docMail docPhone docSpecialty docRoom memberStatus createdAt }
      metaCounter { total }
    }
  }
`;

export const GET_ADMIN_RECEPTIONISTS = gql`
  query GetAdminWorkspaceReceptionists($input: ReceptionistInquiry!) {
    getReceptionists(input: $input) {
      list { _id receptionistNick receptionistFullName receptionistPhone receptionistMail memberStatus createdAt }
      metaCounter { total }
    }
  }
`;
