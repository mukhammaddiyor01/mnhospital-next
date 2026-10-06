import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { GET_ADMIN_SERVICES, UPDATE_ADMIN_SERVICE } from '@/apollo/admin/mutation';
import AdminWorkspacePage from '@/libs/components/dashboard/AdminWorkspacePage';
import AdminPagination from '@/libs/components/dashboard/AdminPagination';
import { AdminList, AdminServiceItem, AdminServiceStatus } from '@/libs/components/dashboard/adminTypes';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useTranslation } from '@/libs/i18n/useTranslation';

const LIMIT = 10;
const editableStatuses: AdminServiceStatus[] = ['ACTIVE', 'INACTIVE', 'UNAVAILABLE'];

const AdminServicesPage = () => {
  const t = useTranslation();
  const session = useReactiveVar(userVar);
  const [page, setPage] = useState(1);
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState('');
  const [busyId, setBusyId] = useState('');
  const authorized = Boolean(session._id && session.memberType === MemberType.ADMIN);
  const [loadServices, listState] = useMutation<{ getAllServicesByAdmin: AdminList<AdminServiceItem> }>(GET_ADMIN_SERVICES);
  const [updateService] = useMutation(UPDATE_ADMIN_SERVICE);
  const input = { page, limit: LIMIT, search: search ? { text: search } : {} };

  useEffect(() => {
    if (authorized) void loadServices({ variables: { input } });
  // `input` is derived from page and search; avoid refetching on unrelated renders.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorized, page, search, loadServices]);

  const list = listState.data?.getAllServicesByAdmin.list ?? [];
  const total = listState.data?.getAllServicesByAdmin.metaCounter?.[0]?.total ?? 0;
  const refresh = () => loadServices({ variables: { input } });
  const changeStatus = async (service: AdminServiceItem, serviceStatus: AdminServiceStatus) => {
    if (service.serviceStatus === serviceStatus || !editableStatuses.includes(service.serviceStatus) || !editableStatuses.includes(serviceStatus)) return;
    setBusyId(service._id);
    setFeedback('');
    try {
      await updateService({ variables: { input: { _id: service._id, serviceStatus } } });
      await refresh();
      setFeedback(t('admin.saved'));
    } catch { setFeedback(t('admin.actionError')); }
    finally { setBusyId(''); }
  };

  const savePrice = async (event: FormEvent<HTMLFormElement>, service: AdminServiceItem) => {
    event.preventDefault();
    const price = Number(new FormData(event.currentTarget).get('price'));
    if (!Number.isFinite(price) || price < 0 || Math.abs(Math.round(price * 100) - price * 100) > 0.000001) return;
    setBusyId(service._id);
    setFeedback('');
    try {
      await updateService({ variables: { input: { _id: service._id, servicePrice: price } } });
      await refresh();
      setFeedback(t('admin.saved'));
    } catch { setFeedback(t('admin.actionError')); }
    finally { setBusyId(''); }
  };

  return <AdminWorkspacePage titleKey="nav.services" introKey="admin.servicesIntro">
    <section className="clinical-staff-panel clinical-admin-resource"><header><h2>{t('nav.services')}</h2></header>
      <form className="clinical-admin-filter" onSubmit={(event) => { event.preventDefault(); setPage(1); setSearch(searchDraft.trim()); }}><input value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder={t('admin.search')} aria-label={t('admin.search')} /><button type="submit">{t('admin.searchAction')}</button></form>
      {feedback && <p className="clinical-admin-feedback" role="status">{feedback}</p>}
      {listState.loading && <p className="clinical-staff-state">{t('dashboard.loading')}</p>}
      {listState.error && <p className="clinical-staff-state clinical-form-error" role="alert">{t('admin.loadError')}</p>}
      {!listState.loading && !listState.error && !list.length && <p className="clinical-staff-state">{t('admin.noResults')}</p>}
      {!listState.loading && !listState.error && !!list.length && <div className="clinical-staff-table-scroll"><table><thead><tr><th>{t('nav.services')}</th><th>{t('admin.serviceType')}</th><th>{t('admin.price')}</th><th>{t('admin.status')}</th></tr></thead><tbody>{list.map((service) => <tr key={service._id}><td><strong>{service.serviceName}</strong><small>{service.serviceTitle}</small></td><td>{service.serviceType.replaceAll('_', ' ')}</td><td><form className="clinical-admin-price" onSubmit={(event) => void savePrice(event, service)}><input name="price" type="number" min="0" step="0.01" defaultValue={service.servicePrice} key={`${service._id}-${service.servicePrice}`} aria-label={`${service.serviceName}: ${t('admin.price')}`} disabled={busyId === service._id || service.serviceStatus === 'DELETED'} /><button type="submit" disabled={busyId === service._id || service.serviceStatus === 'DELETED'}>{t('admin.save')}</button></form></td><td>{editableStatuses.includes(service.serviceStatus) ? <select aria-label={`${service.serviceName}: ${t('admin.status')}`} value={service.serviceStatus} disabled={busyId === service._id} onChange={(event) => void changeStatus(service, event.target.value as AdminServiceStatus)}><option value="ACTIVE">{t('admin.active')}</option><option value="INACTIVE">{t('admin.inactive')}</option><option value="UNAVAILABLE">{t('admin.unavailable')}</option></select> : <span className="clinical-staff-status">{service.serviceStatus.replaceAll('_', ' ')}</span>}</td></tr>)}</tbody></table></div>}
      <AdminPagination page={page} total={total} limit={LIMIT} onChange={setPage} />
    </section>
  </AdminWorkspacePage>;
};

export default AdminServicesPage;
