import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { GET_RECEPTION_TASKS } from '@/apollo/staff-workspace/query';
import { UPDATE_RECEPTION_TASK } from '@/apollo/staff-workspace/mutation';
import StaffRolePage from '@/libs/components/dashboard/StaffRolePage';
import AdminPagination from '@/libs/components/dashboard/AdminPagination';
import { ReceptionTask, ReceptionTaskStatus, StaffList } from '@/libs/components/dashboard/staffTypes';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useTranslation } from '@/libs/i18n/useTranslation';
import Link from 'next/link';

const LIMIT = 10;
export default function ReceptionistTasks() {
  const t = useTranslation();
  const session = useReactiveVar(userVar);
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState('');
  const [feedback, setFeedback] = useState('');
  const { data, loading, error, refetch } = useQuery<{ getReceptionTasks: StaffList<ReceptionTask> }>(GET_RECEPTION_TASKS, {
    variables: { input: { page, limit: LIMIT } }, skip: !session._id || session.memberType !== MemberType.RECEPTIONIST, fetchPolicy: 'network-only',
  });
  const [updateTask] = useMutation(UPDATE_RECEPTION_TASK);
  const list = data?.getReceptionTasks.list ?? [];
  const total = data?.getReceptionTasks.metaCounter?.[0]?.total ?? 0;
  const transitions = (task: ReceptionTask): ReceptionTaskStatus[] => {
    if (task.taskStatus === 'PENDING') return task.receptionistId ? ['ACCEPTED', 'CANCELLED'] : ['ACCEPTED'];
    if (task.taskStatus === 'ACCEPTED') return task.taskType === 'CHECK_IN' ? ['CANCELLED'] : ['IN_PROGRESS', 'CANCELLED'];
    if (task.taskStatus === 'IN_PROGRESS') return ['COMPLETED', 'CANCELLED'];
    return [];
  };
  const submit = async (event: FormEvent<HTMLFormElement>, task: ReceptionTask) => {
    event.preventDefault();
    const values = new FormData(event.currentTarget);
    const status = String(values.get('status')) as ReceptionTaskStatus;
    if (!transitions(task).includes(status)) return;
    const result = String(values.get('result') ?? '').trim();
    if (status === 'COMPLETED' && !result && !task.taskResult) { setFeedback(t('staff.result')); return; }
    setBusyId(task._id); setFeedback('');
    try {
      await updateTask({ variables: { input: { taskId: task._id, taskStatus: status, ...(result ? { taskResult: result } : {}) } } });
      await refetch(); setFeedback(t('admin.saved'));
    } catch (requestError: any) { setFeedback(requestError?.message ?? t('admin.actionError')); }
    finally { setBusyId(''); }
  };

  return <StaffRolePage role={MemberType.RECEPTIONIST} titleKey="dashboard.pendingWork" introKey="staff.tasksIntro">
    <section className="clinical-staff-panel clinical-admin-resource"><header><h2>{t('dashboard.receptionistTasks')}</h2></header>
      {feedback && <p className="clinical-admin-feedback" role="status">{feedback}</p>}
      {loading && <p className="clinical-staff-state">{t('dashboard.loading')}</p>}
      {error && <p className="clinical-staff-state clinical-form-error" role="alert">{t('admin.loadError')}</p>}
      {!loading && !error && !list.length && <p className="clinical-staff-state">{t('admin.noResults')}</p>}
      {!loading && !error && !!list.length && <div className="clinical-staff-table-scroll"><table><thead><tr><th>{t('staff.appointmentId')}</th><th>{t('staff.instruction')}</th><th>{t('staff.priority')}</th><th>{t('admin.status')}</th><th>{t('staff.update')}</th></tr></thead><tbody>{list.map((task) => <tr key={task._id}><td>{task.appointmentId}</td><td><strong>{task.taskType.replaceAll('_', ' ')}</strong><small>{task.taskInstruction}</small></td><td>{task.taskPriority}</td><td><span className="clinical-staff-status">{task.taskStatus.replaceAll('_', ' ')}</span></td><td><div className="clinical-staff-row-actions">{task.taskType === 'CHECK_IN' && task.taskStatus === 'ACCEPTED' && <Link href="/receptionist-workspace/appointments">{t('staff.checkIn')}</Link>}{transitions(task).length ? <form className="clinical-staff-inline-form" onSubmit={(event) => void submit(event, task)}><select name="status" aria-label={`${task.taskType}: ${t('staff.nextStatus')}`} required defaultValue=""><option value="" disabled>{t('staff.nextStatus')}</option>{transitions(task).map((status) => <option value={status} key={status}>{status.replaceAll('_', ' ')}</option>)}</select>{task.taskStatus === 'IN_PROGRESS' && <input name="result" placeholder={t('staff.result')} aria-label={t('staff.result')} maxLength={2000} />}<button type="submit" disabled={busyId === task._id}>{t('staff.update')}</button></form> : '—'}</div></td></tr>)}</tbody></table></div>}
      <AdminPagination page={page} total={total} limit={LIMIT} onChange={setPage} />
    </section>
  </StaffRolePage>;
}
