import { useQuery } from '@apollo/client';
import { GET_COMMENTS } from '@/apollo/comment/query';
import { Comment, CommentsInquiry } from './types/comment';

interface CommentsSectionProps {
	serviceId: string;
}

const formatCommentDate = (value: string) => {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? 'Recently' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const CommentsSection = ({ serviceId }: CommentsSectionProps) => {
	const input: CommentsInquiry = { page: 1, limit: 10, sort: 'createdAt', direction: 'DESC', search: { commentRefId: serviceId } };
	const { data, loading, error } = useQuery<{ getComments: { list: Comment[]; metaCounter: { total: number } } }>(GET_COMMENTS, {
		variables: { input },
		skip: !serviceId || !process.env.NEXT_PUBLIC_API_GRAPHQL_URL,
		fetchPolicy: 'cache-and-network',
	});
	const comments = data?.getComments?.list ?? [];

	return <section className="comments-section">
		<div className="section-heading"><div><span className="eyebrow">Patient voices</span><h2>Service questions and experiences</h2></div><span className="comment-count">{data?.getComments?.metaCounter?.total ?? comments.length} comments</span></div>
		{loading && <span className="query-status">Loading patient comments…</span>}
		{error && <span className="query-status">Comments are temporarily unavailable.</span>}
		{!loading && comments.length === 0 && <p className="comments-empty">Be the first to share a question or experience about this service.</p>}
		{comments.length > 0 && <div className="comment-list">{comments.map((comment) => <article className="comment-card" key={comment._id}><div className="comment-card-header"><strong>{comment.memberData?.memberFullName ?? comment.memberData?.memberNick ?? 'MN Hospital patient'}</strong><time>{formatCommentDate(comment.createdAt)}</time></div><p>{comment.commentContent}</p></article>)}</div>}
	</section>;
};

export default CommentsSection;
