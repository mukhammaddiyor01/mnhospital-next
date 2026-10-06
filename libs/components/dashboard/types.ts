import { MemberStatus } from '@/libs/components/member/enums/member.enum';

export interface AdminDashboardStats {
  totalPatients: number;
  activePatients: number;
  totalDoctors: number;
  activeDoctors: number;
  totalReceptionists: number;
  activeReceptionists: number;
  totalBookings: number;
  totalAppointments: number;
}

export interface DoctorDashboardStats {
  doctorId: string;
  memberStatus: MemberStatus;
  serviceCount: number;
  patientCount: number;
  appointmentCount: number;
  completedAppointmentCount: number;
  reportCount: number;
}

export interface ReceptionistDashboardStats {
  receptionistId: string;
  memberStatus: MemberStatus;
  taskCount: number;
  pendingTaskCount: number;
  acceptedTaskCount: number;
  inProgressTaskCount: number;
  completedTaskCount: number;
  cancelledTaskCount: number;
}
