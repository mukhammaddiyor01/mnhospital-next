import { gql } from '@apollo/client';

export const GET_ADMIN_SERVICES = gql`
  mutation GetAdminWorkspaceServices($input: ServicesInquiry!) {
    getAllServicesByAdmin(input: $input) {
      list { _id serviceName serviceTitle serviceType servicePrice serviceStatus memberId createdAt }
      metaCounter { total }
    }
  }
`;

export const UPDATE_ADMIN_DOCTOR_STATUS = gql`
  mutation UpdateAdminWorkspaceDoctorStatus($input: DoctorStatusUpdateInput!) {
    updateDoctorStatusByAdmin(input: $input) { _id memberStatus }
  }
`;

export const CREATE_ADMIN_DOCTOR = gql`
  mutation CreateAdminWorkspaceDoctor($input: DoctorInput!) {
    createDoctorByAdmin(input: $input) { _id docNick memberStatus }
  }
`;

export const UPDATE_ADMIN_RECEPTIONIST_STATUS = gql`
  mutation UpdateAdminWorkspaceReceptionistStatus($input: ReceptionistStatusUpdateInput!) {
    updateReceptionistStatusByAdmin(input: $input) { _id memberStatus }
  }
`;

export const CREATE_ADMIN_RECEPTIONIST = gql`
  mutation CreateAdminWorkspaceReceptionist($input: ReceptionistInput!) {
    createReceptionist(input: $input) { _id receptionistNick memberStatus }
  }
`;

export const UPDATE_ADMIN_SERVICE = gql`
  mutation UpdateAdminWorkspaceService($input: ServiceUpdate!) {
    updateServiceByAdmin(input: $input) { _id serviceStatus servicePrice }
  }
`;
