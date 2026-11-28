import { gql } from '@apollo/client';

export const GET_ADMIN_DASHBOARD_STATS = gql`
  query GetAdminDashboardStats {
    getAdminDashboardStats {
      totalPatients activePatients totalDoctors activeDoctors
      totalReceptionists activeReceptionists totalBookings totalAppointments
    }
  }
`;

export const GET_MY_DOCTOR_DASHBOARD_STATS = gql`
  query GetMyDoctorDashboardStats {
    getMyDoctorDashboardStats {
      doctorId memberStatus serviceCount patientCount appointmentCount
      completedAppointmentCount reportCount
    }
  }
`;

export const GET_MY_RECEPTIONIST_DASHBOARD_STATS = gql`
  query GetMyReceptionistDashboardStats {
    getMyReceptionistDashboardStats {
      receptionistId memberStatus taskCount pendingTaskCount acceptedTaskCount
      inProgressTaskCount completedTaskCount cancelledTaskCount
    }
  }
`;

export const GET_MY_DOCTOR_APPOINTMENTS = gql`
  query GetMyDoctorWorkspaceAppointments {
    getAppointments(input: { page: 1, limit: 6 }) {
      list { _id appointmentCode appointmentStatus startsAt appointmentReason patientPreview { patientFullName patientImage } }
    }
  }
`;

export const GET_MY_RECEPTIONIST_APPOINTMENT_QUEUE = gql`
  query GetMyReceptionistWorkspaceQueue {
    getMyReceptionistAppointmentQueue(input: { page: 1, limit: 6 }) {
      list { _id appointmentCode appointmentStatus startsAt appointmentReason patientPreview { patientFullName patientImage } }
    }
  }
`;
