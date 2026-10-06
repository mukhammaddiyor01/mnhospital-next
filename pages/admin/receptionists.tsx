import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { GET_ADMIN_RECEPTIONISTS } from '@/apollo/admin/query';
import { CREATE_ADMIN_RECEPTIONIST, UPDATE_ADMIN_RECEPTIONIST_STATUS } from '@/apollo/admin/mutation';
import AdminWorkspacePage from '@/libs/components/dashboard/AdminWorkspacePage';
import AdminPagination from '@/libs/components/dashboard/AdminPagination';
import { AdminList, AdminReceptionist } from '@/libs/components/dashboard/adminTypes';
import { MemberStatus, MemberType } from '@/libs/components/member/enums/member.enum';
import { useTranslation } from '@/libs/i18n/useTranslation';

const LIMIT = 10;
const emptyReceptionist = { receptionistNick: '', receptionistPassword: '', receptionistPhone: '', receptionistMail: '', receptionistFullName: '' };

const AdminReceptionistsPage = () => {
  const t = useTranslation();
  const session = useReactiveVar(userVar);
  const [page, setPage] = useState(1);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(emptyReceptionist);
  const [feedback, setFeedback] = useState('');
  const [busyId, setBusyId] = useState('');
  const { data, loading, error, refetch } = useQuery<{ getReceptionists: AdminList<AdminReceptionist> }>(GET_ADMIN_RECEPTIONISTS, {
    variables: { input: { page, limit: LIMIT } },
    skip: !session._id || session.memberType !== MemberType.ADMIN,
    fetchPolicy: 'network-only',
  });
  const [updateStatus] = useMutation(UPDATE_ADMIN_RECEPTIONIST_STATUS);
  const [createReceptionist, createState] = useMutation(CREATE_ADMIN_RECEPTIONIST);
  const list = data?.getReceptionists.list ?? [];
  const total = data?.getReceptionists.metaCounter?.[0]?.total ?? 0;

  const changeStatus = async (receptionist: AdminReceptionist, memberStatus: MemberStatus.ACTIVE | MemberStatus.BLOCK) => {
    if (receptionist.memberStatus === memberStatus) return;
    setBusyId(receptionist._id);
    setFeedback('');
    try {
      await updateStatus({ variables: { input: { _id: receptionist._id, memberStatus } } });
      await refetch();
      setFeedback(t('admin.saved'));
    } catch { setFeedback(t('admin.actionError')); }
    finally { setBusyId(''); }
  };

  const submitReceptionist = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback('');
    try {
      await createReceptionist({ variables: { input: {
        receptionistNick: draft.receptionistNick.trim(), receptionistPassword: draft.receptionistPassword,
        receptionistPhone: draft.receptionistPhone.trim(), receptionistMail: draft.receptionistMail.trim(),
        receptionistFullName: draft.receptionistFullName.trim(),
      } } });
      setDraft(emptyReceptionist);
      setCreating(false);
      setPage(1);
      await refetch({ input: { page: 1, limit: LIMIT } });
      setFeedback(t('admin.created'));
    } catch { setFeedback(t('admin.actionError')); }
  };

  return <AdminWorkspacePage titleKey="dashboard.receptionists" introKey="admin.receptionistsIntro">
    <section className="clinical-staff-panel clinical-admin-resource"><header><h2>{t('dashboard.receptionists')}</h2><button type="button" className="clinical-primary-button" onClick={() => setCreating((value) => !value)}>{t('admin.createReceptionist')}</button></header>
      {creating && <form className="clinical-admin-create-form" onSubmit={(event) => void submitReceptionist(event)}>
        <label>{t('admin.nickname')}<input required minLength={3} maxLength={30} value={draft.receptionistNick} onChange={(event) => setDraft({ ...draft, receptionistNick: event.target.value })} /></label>
        <label>{t('admin.name')}<input required minLength={2} maxLength={100} value={draft.receptionistFullName} onChange={(event) => setDraft({ ...draft, receptionistFullName: event.target.value })} /></label>
        <label>{t('admin.phone')}<input required value={draft.receptionistPhone} onChange={(event) => setDraft({ ...draft, receptionistPhone: event.target.value })} /></label>
        <label>{t('admin.email')}<input required type="email" value={draft.receptionistMail} onChange={(event) => setDraft({ ...draft, receptionistMail: event.target.value })} /></label>
        <label>{t('admin.password')}<input required type="password" autoComplete="new-password" minLength={8} maxLength={32} value={draft.receptionistPassword} onChange={(event) => setDraft({ ...draft, receptionistPassword: event.target.value })} /></label>
        <button className="clinical-primary-button" type="submit" disabled={createState.loading}>{t('admin.createReceptionist')}</button>
      </form>}
      {feedback && <p className="clinical-admin-feedback" role="status">{feedback}</p>}
      {loading && <p className="clinical-staff-state">{t('dashboard.loading')}</p>}
      {error && <p className="clinical-staff-state clinical-form-error" role="alert">{t('admin.loadError')}</p>}
      {!loading && !error && !list.length && <p className="clinical-staff-state">{t('admin.noResults')}</p>}
      {!!list.length && <div className="clinical-staff-table-scroll"><table><thead><tr><th>{t('admin.name')}</th><th>{t('admin.phone')}</th><th>{t('admin.email')}</th><th>{t('admin.status')}</th></tr></thead><tbody>{list.map((receptionist) => <tr key={receptionist._id}><td><strong>{receptionist.receptionistFullName}</strong><small>{receptionist.receptionistNick}</small></td><td>{receptionist.receptionistPhone}</td><td>{receptionist.receptionistMail}</td><td><select aria-label={`${receptionist.receptionistNick}: ${t('admin.status')}`} value={receptionist.memberStatus} disabled={busyId === receptionist._id} onChange={(event) => void changeStatus(receptionist, event.target.value as MemberStatus.ACTIVE | MemberStatus.BLOCK)}><option value={MemberStatus.ACTIVE}>{t('admin.active')}</option><option value={MemberStatus.BLOCK}>{t('admin.blocked')}</option></select></td></tr>)}</tbody></table></div>}
      <AdminPagination page={page} total={total} limit={LIMIT} onChange={setPage} />
    </section>
  </AdminWorkspacePage>;
};

export default AdminReceptionistsPage;
