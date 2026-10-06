import { gql } from '@apollo/client';

export const UPDATE_APPOINTMENT_STATUS = gql`
  mutation UpdateStaffAppointmentStatus($input: AppointmentStatusInput!) {
    updateAppointmentStatus(input: $input) { _id appointmentStatus }
  }
`;

export const UPDATE_DOCTOR_SERVICE = gql`
  mutation UpdateDoctorWorkspaceService($input: ServiceUpdate!) {
    updateService(input: $input) { _id serviceStatus servicePrice }
  }
`;

export const CREATE_DOCTOR_REPORT = gql`
  mutation CreateDoctorWorkspaceReport($input: DoctorReportInput!) {
    createDoctorReport(input: $input) { _id appointmentId }
  }
`;

export const UPDATE_RECEPTIONIST_PROFILE = gql`
  mutation UpdateReceptionistWorkspaceProfile($input: ReceptionistProfileUpdateInput!) {
    updateMyReceptionistProfile(input: $input) { _id receptionistFullName receptionistPhone receptionistMail receptionistAddress receptionistDesc }
  }
`;

export const UPDATE_RECEPTION_TASK = gql`
  mutation UpdateReceptionWorkspaceTask($input: ReceptionTaskStatusInput!) {
    updateReceptionTaskStatus(input: $input) { _id taskStatus taskResult }
  }
`;

export const CHECK_IN_RECEPTIONIST_APPOINTMENT = gql`
  mutation CheckInReceptionistWorkspaceAppointment($input: ReceptionistCheckInInput!) {
    checkInReceptionistAppointment(input: $input) { _id appointmentStatus }
  }
`;
