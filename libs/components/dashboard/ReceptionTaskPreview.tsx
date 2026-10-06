import Link from 'next/link';
import { useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { GET_RECEPTION_TASKS } from '@/apollo/staff-workspace/query';
import Icon from '@/libs/components/common/Icon';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { ReceptionTask, StaffList } from './staffTypes';
import { taskPriorityKeys, taskStatusKeys, taskTypeKeys } from './staffLabels';

const ReceptionTaskPreview = () => {
  const t = useTranslation();
  const session = useReactiveVar(userVar);
  const { data, loading, error } = useQuery<{ getReceptionTasks: StaffList<ReceptionTask> }>(GET_RECEPTION_TASKS, {
    variables: { input: { page: 1, limit: 4 } },
    skip: !session._id || session.memberType !== MemberType.RECEPTIONIST,
    fetchPolicy: 'network-only',
  });
  const tasks = data?.getReceptionTasks.list ?? [];

  return <section className="clinical-reception-task-preview" aria-labelledby="reception-task-heading">
    <header><Icon name="assignment" /><h2 id="reception-task-heading">{t('dashboard.recentReceptionTasks')}</h2></header>
    {loading && <p className="clinical-staff-state">{t('dashboard.loading')}</p>}
    {error && <p className="clinical-staff-state clinical-form-error" role="alert">{t('admin.loadError')}</p>}
    {!loading && !error && !tasks.length && <p className="clinical-staff-state">{t('admin.noResults')}</p>}
    {!loading && !error && tasks.length > 0 && <ul>{tasks.map((task) => {
      const typeKey = taskTypeKeys[task.taskType];
      const priorityKey = taskPriorityKeys[task.taskPriority];
      return <li key={task._id}>
        <div><strong>{typeKey ? t(typeKey) : task.taskType}</strong><span className={`clinical-staff-status status-${task.taskStatus.toLowerCase()}`}>{t(taskStatusKeys[task.taskStatus])}</span></div>
        <p>{task.taskInstruction}</p>
        <small>{t('staff.priority')}: {priorityKey ? t(priorityKey) : task.taskPriority}</small>
      </li>;
    })}</ul>}
    <Link className="clinical-reception-panel-link" href="/receptionist-workspace/tasks">{t('dashboard.pendingWork')} <Icon name="arrow_forward" /></Link>
  </section>;
};

export default ReceptionTaskPreview;
