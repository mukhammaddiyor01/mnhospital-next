import { MessageKey } from '@/libs/i18n/messages';
import { AppointmentStatus, ReceptionTaskStatus } from './staffTypes';

export const appointmentStatusKeys: Record<AppointmentStatus, MessageKey> = {
  PENDING: 'dashboard.statusPending', CONFIRMED: 'dashboard.statusConfirmed',
  IN_PROGRESS: 'dashboard.statusInProgress', ENDED: 'dashboard.statusEnded',
  COMPLETED: 'dashboard.statusCompleted', CANCELLED: 'dashboard.statusCancelled',
  NO_SHOW: 'dashboard.statusNoShow',
};
export const taskStatusKeys: Record<ReceptionTaskStatus, MessageKey> = {
  PENDING: 'dashboard.pendingTasks', ACCEPTED: 'dashboard.acceptedTasks',
  IN_PROGRESS: 'dashboard.inProgressTasks', COMPLETED: 'dashboard.completedTasks',
  CANCELLED: 'dashboard.cancelledTasks',
};
export const taskTypeKeys: Partial<Record<string, MessageKey>> = {
  CHECK_IN: 'staff.taskCheckIn', PREPARE_ROOM: 'staff.taskPrepareRoom',
  CALL_PATIENT: 'staff.taskCallPatient', ASSIST: 'staff.taskAssist', OTHER: 'staff.taskOther',
};
export const taskPriorityKeys: Partial<Record<string, MessageKey>> = {
  LOW: 'staff.priorityLow', MEDIUM: 'staff.priorityMedium',
  HIGH: 'staff.priorityHigh', URGENT: 'staff.priorityUrgent',
};
