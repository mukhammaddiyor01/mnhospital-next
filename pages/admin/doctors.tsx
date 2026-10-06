import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { GET_ADMIN_DOCTORS } from '@/apollo/admin/query';
import { CREATE_ADMIN_DOCTOR, UPDATE_ADMIN_DOCTOR_STATUS } from '@/apollo/admin/mutation';
import AdminWorkspacePage from '@/libs/components/dashboard/AdminWorkspacePage';
import AdminPagination from '@/libs/components/dashboard/AdminPagination';
import { AdminDoctor, AdminList } from '@/libs/components/dashboard/adminTypes';
import { MemberStatus, MemberType } from '@/libs/components/member/enums/member.enum';
import { useTranslation } from '@/libs/i18n/useTranslation';

const LIMIT = 10;
const emptyDoctor = { docNick: '', docPassword: '', docPhone: '', docMail: '', docFullName: '', docExperience: '', docRoom: '' };

const AdminDoctorsPage = () => {
  const t = useTranslation();
  const session = useReactiveVar(userVar);
  const [page, setPage] = useState(1);
  const [searchDraft, setSearchDraft] = useState('');
  const [search, setSearch] = useState('');
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState(emptyDoctor);
  const [feedback, setFeedback] = useState('');
  const [busyId, setBusyId] = useState('');
  const { data, loading, error, refetch } = useQuery<{ getDoctorsByAdmin: AdminList<AdminDoctor> }>(GET_ADMIN_DOCTORS, {
    variables: { input: { page, limit: LIMIT, ...(search ? { text: search } : {}) } },
    skip: !session._id || session.memberType !== MemberType.ADMIN,
    fetchPolicy: 'network-only',
  });
  const [updateStatus] = useMutation(UPDATE_ADMIN_DOCTOR_STATUS);
  const [createDoctor, createState] = useMutation(CREATE_ADMIN_DOCTOR);
  const list = data?.getDoctorsByAdmin.list ?? [];
  const total = data?.getDoctorsByAdmin.metaCounter?.[0]?.total ?? 0;

  const changeStatus = async (doctor: AdminDoctor, memberStatus: MemberStatus.ACTIVE | MemberStatus.BLOCK) => {
    if (doctor.memberStatus === memberStatus) return;
    setBusyId(doctor._id);
    setFeedback('');
    try {
      await updateStatus({ variables: { input: { _id: doctor._id, memberStatus } } });
      await refetch();
      setFeedback(t('admin.saved'));
    } catch { setFeedback(t('admin.actionError')); }
    finally { setBusyId(''); }
  };

  const submitDoctor = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback('');
    try {
      await createDoctor({ variables: { input: {
        docNick: draft.docNick.trim(), docPassword: draft.docPassword, docPhone: draft.docPhone.trim(),
        docFullName: draft.docFullName.trim(), docExperience: Number(draft.docExperience), docRoom: draft.docRoom.trim(),
        ...(draft.docMail.trim() ? { docMail: draft.docMail.trim() } : {}),
      } } });
      setDraft(emptyDoctor);
      setCreating(false);
      setPage(1);
      await refetch({ input: { page: 1, limit: LIMIT, ...(search ? { text: search } : {}) } });
      setFeedback(t('admin.created'));
    } catch { setFeedback(t('admin.actionError')); }
  };

  return <AdminWorkspacePage titleKey="nav.doctors" introKey="admin.doctorsIntro">
    <section className="clinical-staff-panel clinical-admin-resource">
      <header><h2>{t('nav.doctors')}</h2><button type="button" className="clinical-primary-button" onClick={() => setCreating((value) => !value)}>{t('admin.createDoctor')}</button></header>
      {creating && <form className="clinical-admin-create-form" onSubmit={(event) => void submitDoctor(event)}>
        <label>{t('admin.nickname')}<input required minLength={3} maxLength={30} value={draft.docNick} onChange={(event) => setDraft({ ...draft, docNick: event.target.value })} /></label>
        <label>{t('admin.name')}<input minLength={2} maxLength={100} value={draft.docFullName} onChange={(event) => setDraft({ ...draft, docFullName: event.target.value })} /></label>
        <label>{t('admin.phone')}<input required value={draft.docPhone} onChange={(event) => setDraft({ ...draft, docPhone: event.target.value })} /></label>
        <label>{t('admin.email')}<input type="email" value={draft.docMail} onChange={(event) => setDraft({ ...draft, docMail: event.target.value })} /></label>
        <label>{t('admin.room')}<input required value={draft.docRoom} onChange={(event) => setDraft({ ...draft, docRoom: event.target.value })} /></label>
        <label>{t('admin.experience')}<input required type="number" min="0" step="1" value={draft.docExperience} onChange={(event) => setDraft({ ...draft, docExperience: event.target.value })} /></label>
        <label>{t('admin.password')}<input required type="password" autoComplete="new-password" minLength={8} maxLength={32} value={draft.docPassword} onChange={(event) => setDraft({ ...draft, docPassword: event.target.value })} /></label>
        <button className="clinical-primary-button" type="submit" disabled={createState.loading}>{t('admin.createDoctor')}</button>
      </form>}
      <form className="clinical-admin-filter" onSubmit={(event) => { event.preventDefault(); setPage(1); setSearch(searchDraft.trim()); }}><input value={searchDraft} onChange={(event) => setSearchDraft(event.target.value)} placeholder={t('admin.search')} aria-label={t('admin.search')} /><button type="submit">{t('admin.searchAction')}</button></form>
      {feedback && <p className="clinical-admin-feedback" role="status">{feedback}</p>}
      {loading && <p className="clinical-staff-state">{t('dashboard.loading')}</p>}
      {error && <p className="clinical-staff-state clinical-form-error" role="alert">{t('admin.loadError')}</p>}
      {!loading && !error && !list.length && <p className="clinical-staff-state">{t('admin.noResults')}</p>}
      {!!list.length && <div className="clinical-staff-table-scroll"><table><thead><tr><th>{t('admin.name')}</th><th>{t('admin.phone')}</th><th>{t('admin.room')}</th><th>{t('admin.status')}</th></tr></thead><tbody>{list.map((doctor) => <tr key={doctor._id}><td><Link href={`/doctor/${doctor._id}`}><strong>{doctor.docFullName || doctor.docNick}</strong></Link><small>{doctor.docNick}{doctor.docMail ? ` · ${doctor.docMail}` : ''}</small></td><td>{doctor.docPhone}</td><td>{doctor.docRoom}</td><td><select aria-label={`${doctor.docNick}: ${t('admin.status')}`} value={doctor.memberStatus} disabled={busyId === doctor._id || doctor.memberStatus === MemberStatus.DELETE} onChange={(event) => void changeStatus(doctor, event.target.value as MemberStatus.ACTIVE | MemberStatus.BLOCK)}><option value={MemberStatus.ACTIVE}>{t('admin.active')}</option><option value={MemberStatus.BLOCK}>{t('admin.blocked')}</option>{doctor.memberStatus === MemberStatus.DELETE && <option value={MemberStatus.DELETE}>DELETE</option>}</select></td></tr>)}</tbody></table></div>}
      <AdminPagination page={page} total={total} limit={LIMIT} onChange={setPage} />
    </section>
  </AdminWorkspacePage>;
};

export default AdminDoctorsPage;
