import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { GET_DOCTOR_SERVICES } from '@/apollo/staff-workspace/query';
import { UPDATE_DOCTOR_SERVICE } from '@/apollo/staff-workspace/mutation';
import StaffRolePage from '@/libs/components/dashboard/StaffRolePage';
import AdminPagination from '@/libs/components/dashboard/AdminPagination';
import { DoctorService, StaffList } from '@/libs/components/dashboard/staffTypes';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useTranslation } from '@/libs/i18n/useTranslation';

const LIMIT = 10;
export default function DoctorServices() {
  const t = useTranslation();
  const session = useReactiveVar(userVar);
  const [page, setPage] = useState(1);
  const [busyId, setBusyId] = useState('');
  const [feedback, setFeedback] = useState('');
  const { data, loading, error, refetch } = useQuery<{ getDoctorServices: StaffList<DoctorService> }>(GET_DOCTOR_SERVICES, {
    variables: { input: { page, limit: LIMIT } }, skip: !session._id || session.memberType !== MemberType.DOCTOR, fetchPolicy: 'network-only',
  });
  const [updateService] = useMutation(UPDATE_DOCTOR_SERVICE);
  const list = data?.getDoctorServices.list ?? [];
  const total = data?.getDoctorServices.metaCounter?.[0]?.total ?? 0;
  const savePrice = async (event: FormEvent<HTMLFormElement>, service: DoctorService) => {
    event.preventDefault();
    if (service.serviceStatus !== 'ACTIVE') return;
    const price = Number(new FormData(event.currentTarget).get('price'));
    if (!Number.isFinite(price) || price < 0 || Math.abs(Math.round(price * 100) - price * 100) > 0.000001) return;
    setBusyId(service._id); setFeedback('');
    try {
      await updateService({ variables: { input: { _id: service._id, servicePrice: price } } });
      await refetch(); setFeedback(t('admin.saved'));
    } catch (requestError: any) { setFeedback(requestError?.message ?? t('admin.actionError')); }
    finally { setBusyId(''); }
  };
  const pause = async (service: DoctorService, status: 'INACTIVE' | 'UNAVAILABLE') => {
    if (service.serviceStatus !== 'ACTIVE') return;
    setBusyId(service._id); setFeedback('');
    try {
      await updateService({ variables: { input: { _id: service._id, serviceStatus: status } } });
      await refetch(); setFeedback(t('admin.saved'));
    } catch (requestError: any) { setFeedback(requestError?.message ?? t('admin.actionError')); }
    finally { setBusyId(''); }
  };

  return <StaffRolePage role={MemberType.DOCTOR} titleKey="dashboard.myServices" introKey="staff.servicesIntro">
    <section className="clinical-staff-panel clinical-admin-resource"><header><h2>{t('dashboard.myServices')}</h2></header>
      {feedback && <p className="clinical-admin-feedback" role="status">{feedback}</p>}
      {loading && <p className="clinical-staff-state">{t('dashboard.loading')}</p>}
      {error && <p className="clinical-staff-state clinical-form-error" role="alert">{t('admin.loadError')}</p>}
      {!loading && !error && !list.length && <p className="clinical-staff-state">{t('admin.noResults')}</p>}
      {!loading && !error && !!list.length && <div className="clinical-staff-table-scroll"><table><thead><tr><th>{t('dashboard.myServices')}</th><th>{t('admin.serviceType')}</th><th>{t('admin.price')}</th><th>{t('admin.status')}</th></tr></thead><tbody>{list.map((service) => <tr key={service._id}><td><strong>{service.serviceName}</strong><small>{service.serviceTitle}</small></td><td>{service.serviceType.replaceAll('_', ' ')}</td><td>{service.serviceStatus === 'ACTIVE' ? <form className="clinical-admin-price" onSubmit={(event) => void savePrice(event, service)}><input name="price" type="number" min="0" step="0.01" defaultValue={service.servicePrice} key={`${service._id}-${service.servicePrice}`} aria-label={`${service.serviceName}: ${t('admin.price')}`} disabled={busyId === service._id} /><button type="submit" disabled={busyId === service._id}>{t('admin.save')}</button></form> : service.servicePrice}</td><td>{service.serviceStatus === 'ACTIVE' ? <select value="ACTIVE" aria-label={`${service.serviceName}: ${t('admin.status')}`} disabled={busyId === service._id} onChange={(event) => void pause(service, event.target.value as 'INACTIVE' | 'UNAVAILABLE')}><option value="ACTIVE">{t('admin.active')}</option><option value="INACTIVE">{t('admin.inactive')}</option><option value="UNAVAILABLE">{t('admin.unavailable')}</option></select> : <span className="clinical-staff-status">{service.serviceStatus.replaceAll('_', ' ')}</span>}</td></tr>)}</tbody></table></div>}
      <AdminPagination page={page} total={total} limit={LIMIT} onChange={setPage} />
    </section>
  </StaffRolePage>;
}
