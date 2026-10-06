import Head from 'next/head';
import { ReactNode, useEffect, useState } from 'react';
import { getJwtToken, updateUserInfo } from '@/libs/auth';
import { useTranslation } from '@/libs/i18n/useTranslation';

const StaffLayout = ({ children }: { children: ReactNode }) => {
  const t = useTranslation();
  const [restored, setRestored] = useState(false);
  useEffect(() => {
    const token = getJwtToken();
    if (token) updateUserInfo(token);
    setRestored(true);
  }, []);

  return <>
    <Head>
      <title>{t('dashboard.title')} | MN Hospital</title>
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link rel="icon" type="image/png" href="/favicon.png" />
    </Head>
    {restored ? children : <main className="clinical-staff-gate"><p role="status">{t('dashboard.loading')}</p></main>}
  </>;
};

export default StaffLayout;
