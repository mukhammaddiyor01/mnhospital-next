import Link from 'next/link';
import withLayoutMain from '@/libs/components/layout/LayoutHome';

const ArticlePage = () => <div className="inner-page"><div className="container"><div className="page-intro"><span className="eyebrow">MN Hospital journal</span><h1>Care beyond the appointment.</h1><p>Practical health information and updates from our clinical community.</p></div><div className="placeholder-panel"><h2>Latest hospital updates</h2><p>Article data is ready to be loaded from the `getArticles` GraphQL resolver.</p><Link className="button button-primary" href="/">Back to home</Link></div></div></div>;

export default withLayoutMain(ArticlePage);
