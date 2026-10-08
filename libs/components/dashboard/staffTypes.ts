import { MemberType } from '@/libs/components/member/enums/member.enum';

export interface StaffList<T> { list: T[]; metaCounter?: { total: number }[] }

export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'ENDED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
export interface StaffAppointment {
  patientPreview?: { patientFullName?: string; patientImage?: string }; _id: string; appointmentCode: string; appointmentStatus: AppointmentStatus; appointmentReason: string; patientId: string; doctorId: string; startsAt: string; endsAt: string }

export interface DoctorService { _id: string; serviceName: string; serviceTitle: string; serviceType: string; serviceStatus: string; servicePrice: number; serviceDuration?: string }
export interface DoctorReport { _id: string; appointmentId: string; patientId: string; docReportDiagnosis: string; docReportSymptoms: string; docReportMedication: string; docReportFollowUp: string; docReportFollowUpDate?: string; createdAt: string }

export type ReceptionTaskStatus = 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export interface ReceptionTask { _id: string; appointmentId: string; receptionistId?: string; taskType: string; taskPriority: string; taskStatus: ReceptionTaskStatus; taskInstruction: string; taskResult?: string; dueAt?: string }
export interface ReceptionistProfile { _id: string; memberType: MemberType; receptionistNick: string; receptionistFullName: string; receptionistPhone: string; receptionistMail: string; receptionistImage?: string; receptionistAddress?: string; receptionistDesc?: string; memberStatus: string; accessToken?: string }
export interface DoctorProfile { _id: string; memberType: MemberType; memberStatus: string; docNick: string; docFullName: string; docPhone: string; docMail?: string; docImage?: string; docAddress?: string; docDesc?: string; docSpecialty?: string; docRoom: string; docExperience: number; accessToken?: string }
