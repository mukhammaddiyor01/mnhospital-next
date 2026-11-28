import { useState } from 'react';
import Link from 'next/link';
import { useQuery } from '@apollo/client';
import { operation } from '@/apollo/workspace/operations';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import AdminPagination from '@/libs/components/dashboard/AdminPagination';
import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';
const LIST = operation(
	'query',
	'getPublishedNotices',
	'NoticeInquiry',
	'list { _id noticeTitle noticeContent noticeCategory createdAt } metaCounter { total }',
);
function Page() {
	const w = useWorkspaceText();
	const [page, setPage] = useState(1);
	const { data, loading, error, refetch } = useQuery(LIST, {
		variables: { input: { page, limit: 10 } },
		fetchPolicy: 'network-only',
	});
	return (
		<div className="clinical-inner-page">
			<section className="clinical-inner-hero">
				<h1>{w('notices')}</h1>
				<Link href="/">MN Hospital</Link>
			</section>
			<section className="clinical-inner-section">
				{loading && <p>{w('refresh')}</p>}
				{error && <p role="alert">{error.message}</p>}
				<button disabled={loading} onClick={() => void refetch()}>
					{w('refresh')}
				</button>
				{data?.getPublishedNotices.list.map((notice: any) => (
					<article key={notice._id}>
						<h2>{notice.noticeTitle}</h2>
						<small>
							{notice.noticeCategory} ·{' '}
							{new Date(notice.createdAt).toLocaleDateString()}
						</small>
						<p style={{ whiteSpace: 'pre-wrap' }}>{notice.noticeContent}</p>
					</article>
				))}
				<AdminPagination
					page={page}
					limit={10}
					total={data?.getPublishedNotices.metaCounter?.[0]?.total ?? 0}
					onChange={setPage}
				/>
			</section>
		</div>
	);
}
export default withLayoutMain(Page);
