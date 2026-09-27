import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { GET_COMMENTS } from '@/apollo/comment/query';
import { CREATE_COMMENT } from '@/apollo/comment/mutation';
import { userVar } from '@/apollo/store';
import { Comment, CommentsInquiry, CreateCommentInput } from './types/comment';
import { ReferenceGroup } from './enums/comment.enum';

interface CommentsSectionProps {
	serviceId: string;
}

const formatCommentDate = (value: string) => {
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? 'Recently' : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const CommentsSection = ({ serviceId }: CommentsSectionProps) => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [commentContent, setCommentContent] = useState('');
	const [formError, setFormError] = useState('');
	const input: CommentsInquiry = { page: 1, limit: 10, sort: 'createdAt', direction: 'DESC', search: { commentRefId: serviceId } };
	const { data, loading, error } = useQuery<{ getComments: { list: Comment[]; metaCounter: { total: number } } }>(GET_COMMENTS, {
		variables: { input },
		skip: !serviceId || !process.env.NEXT_PUBLIC_API_GRAPHQL_URL,
		fetchPolicy: 'cache-and-network',
	});
	const [createComment, { loading: creating }] = useMutation(CREATE_COMMENT);
	const comments = data?.getComments?.list ?? [];

	const handleCreateComment = async (event: React.FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!user._id) {
			await router.push(`/account/signin?redirect=/service/${serviceId}`);
			return;
		}
		if (!commentContent.trim()) {
			setFormError('Please write a question or experience first.');
			return;
		}
		try {
			const commentInput: CreateCommentInput = { commentGroup: ReferenceGroup.SERVICE, commentContent: commentContent.trim(), commentRefId: serviceId };
			await createComment({ variables: { input: commentInput }, refetchQueries: [{ query: GET_COMMENTS, variables: { input } }], awaitRefetchQueries: true });
			setCommentContent('');
			setFormError('');
		} catch (error) {
			setFormError('Your comment could not be published. Please try again.');
		}
	};

	return <section className="comments-section">
		<div className="section-heading"><div><span className="eyebrow">Patient voices</span><h2>Service questions and experiences</h2></div><span className="comment-count">{data?.getComments?.metaCounter?.total ?? comments.length} comments</span></div>
		<form className="comment-form" onSubmit={handleCreateComment}><label htmlFor="service-comment">Share a question or experience</label><textarea id="service-comment" value={commentContent} onChange={(event) => setCommentContent(event.target.value)} placeholder="What would you like other patients to know?" rows={4} /><div className="comment-form-footer">{formError && <span className="form-error">{formError}</span>}<button className="button button-primary button-small" type="submit" disabled={creating}>{creating ? 'Publishing…' : user._id ? 'Publish comment' : 'Sign in to comment'}</button></div></form>
		{loading && <span className="query-status">Loading patient comments…</span>}
		{error && <span className="query-status">Comments are temporarily unavailable.</span>}
		{!loading && comments.length === 0 && <p className="comments-empty">Be the first to share a question or experience about this service.</p>}
		{comments.length > 0 && <div className="comment-list">{comments.map((comment) => <article className="comment-card" key={comment._id}><div className="comment-card-header"><strong>{comment.memberData?.memberFullName ?? comment.memberData?.memberNick ?? 'MN Hospital patient'}</strong><time>{formatCommentDate(comment.createdAt)}</time></div><p>{comment.commentContent}</p></article>)}</div>}
	</section>;
};

export default CommentsSection;
