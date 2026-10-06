import { useTranslation } from '@/libs/i18n/useTranslation';

const AdminPagination = ({ page, total, limit, onChange }: { page: number; total: number; limit: number; onChange: (page: number) => void }) => {
  const t = useTranslation();
  const pages = Math.max(1, Math.ceil(total / limit));
  return <nav className="clinical-admin-pagination" aria-label={t('notifications.pages')}><span>{t('admin.total')}: {total.toLocaleString()}</span><div><button type="button" disabled={page <= 1} onClick={() => onChange(page - 1)}>{t('admin.previous')}</button><span>{page} / {pages}</span><button type="button" disabled={page >= pages} onClick={() => onChange(page + 1)}>{t('admin.next')}</button></div></nav>;
};

export default AdminPagination;
