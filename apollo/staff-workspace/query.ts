import { gql } from '@apollo/client';

export const GET_STAFF_APPOINTMENTS = gql`
  query GetStaffWorkspaceAppointments($input: StaffAppointmentInquiry!) {
    getAppointments(input: $input) { list { _id appointmentCode appointmentStatus appointmentReason patientId doctorId startsAt endsAt } metaCounter { total } }
  }
`;

export const GET_DOCTOR_SERVICES = gql`
  query GetDoctorWorkspaceServices($input: DoctorServicesInquiry!) {
    getDoctorServices(input: $input) { list { _id serviceName serviceTitle serviceType serviceStatus servicePrice serviceDuration } metaCounter { total } }
  }
`;

export const GET_DOCTOR_REPORTS = gql`
  query GetDoctorWorkspaceReports($input: DoctorReportInquiry!) {
    getMyDoctorReports(input: $input) { list { _id appointmentId patientId docReportDiagnosis docReportSymptoms docReportMedication docReportFollowUp createdAt } metaCounter { total } }
  }
`;

export const GET_RECEPTIONIST_PROFILE = gql`
  query GetReceptionistWorkspaceProfile {
    getMyReceptionistProfile { _id receptionistNick receptionistFullName receptionistPhone receptionistMail receptionistAddress receptionistDesc memberStatus }
  }
`;

export const GET_RECEPTION_TASKS = gql`
  query GetReceptionWorkspaceTasks($input: ReceptionTaskInquiry!) {
    getReceptionTasks(input: $input) { list { _id appointmentId receptionistId taskType taskPriority taskStatus taskInstruction taskResult dueAt } metaCounter { total } }
  }
`;

export const GET_RECEPTIONIST_QUEUE = gql`
  query GetReceptionistWorkspaceAppointments($input: ReceptionistAppointmentQueueInquiry!) {
    getMyReceptionistAppointmentQueue(input: $input) { list { _id appointmentCode appointmentStatus appointmentReason patientId doctorId startsAt endsAt } metaCounter { total } }
  }
`;

export const GET_RECEPTIONIST_REPORTS = gql`
  query GetReceptionistWorkspaceReports($input: ReceptionistReportInquiry!) {
    getMyReceptionistReports(input: $input) { list { _id appointmentId patientId docReportDiagnosis docReportSymptoms docReportMedication docReportFollowUp createdAt } metaCounter { total } }
  }
`;
