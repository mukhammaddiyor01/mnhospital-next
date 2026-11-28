import { gql } from '@apollo/client';

export const UPDATE_DOCTOR_PROFILE = gql`
  mutation UpdateDoctorWorkspaceProfile($input: DoctorProfileUpdateInput!) {
    updateMyDoctorProfile(input: $input) { _id memberType memberStatus docNick docFullName docPhone docMail docImage docAddress docDesc docSpecialty docRoom docExperience accessToken }
  }
`;

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

export const UPDATE_DOCTOR_REPORT = gql`
  mutation UpdateDoctorWorkspaceReport($input: DoctorReportUpdateInput!) {
    updateDoctorReport(input: $input) { _id updatedAt }
  }
`;

export const UPDATE_RECEPTIONIST_PROFILE = gql`
  mutation UpdateReceptionistWorkspaceProfile($input: ReceptionistProfileUpdateInput!) {
    updateMyReceptionistProfile(input: $input) { _id memberType memberStatus receptionistNick receptionistFullName receptionistPhone receptionistMail receptionistImage receptionistAddress receptionistDesc accessToken }
  }
`;

export const UPDATE_RECEPTION_TASK = gql`
  mutation UpdateReceptionWorkspaceTask($input: ReceptionTaskStatusInput!) {
    updateReceptionTaskStatus(input: $input) { _id taskStatus taskResult }
  }
`;

export const CREATE_RECEPTION_TASK = gql`
  mutation CreateReceptionWorkspaceTask($input: ReceptionTaskInput!) {
    createReceptionTask(input: $input) { _id appointmentId taskStatus }
  }
`;

export const CHECK_IN_RECEPTIONIST_APPOINTMENT = gql`
  mutation CheckInReceptionistWorkspaceAppointment($input: ReceptionistCheckInInput!) {
    checkInReceptionistAppointment(input: $input) { _id appointmentStatus }
  }
`;
