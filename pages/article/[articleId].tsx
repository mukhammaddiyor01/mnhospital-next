import { useRouter } from 'next/router';
import withLayoutMain from '@/libs/components/layout/LayoutHome';

const ArticleDetailPage = () => { const router = useRouter(); const title = String(router.query.articleId ?? 'hospital update').replaceAll('-', ' '); return <div className="inner-page"><div className="container"><div className="placeholder-panel"><span className="eyebrow">MN Hospital journal</span><h1>{title.charAt(0).toUpperCase() + title.slice(1)}</h1><p>Article content, likes, and comments will be loaded from the MN Hospital article GraphQL resolver.</p></div></div></div>; };

export default withLayoutMain(ArticleDetailPage);
