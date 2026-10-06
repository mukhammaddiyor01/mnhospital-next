import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import { useState } from 'react';
import { useRouter } from 'next/router';
import { GET_COMMENTS } from '@/apollo/comment/query';
import { operation } from '@/apollo/workspace/operations';
import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';
import { CREATE_COMMENT } from '@/apollo/comment/mutation';
import { userVar } from '@/apollo/store';
import { Comment, CommentsInquiry, CreateCommentInput } from './types/comment';
import { ReferenceGroup } from './enums/comment.enum';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { usePreferences } from '@/libs/components/preference/PreferenceProvider';

interface CommentsSectionProps {
	targetId: string;
	group:
		ReferenceGroup.SERVICE | ReferenceGroup.ARTICLE | ReferenceGroup.DOCTOR;
}

const UPDATE_COMMENT = operation(
	'mutation',
	'updateComment',
	'CommentUpdate',
	'_id commentContent commentStatus',
);

const formatCommentDate = (value: string, locale: string, recent: string) => {
	const date = new Date(value);
	return Number.isNaN(date.getTime())
		? recent
		: date.toLocaleDateString(locale, {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
			});
};

const CommentsSection = ({ targetId, group }: CommentsSectionProps) => {
	const t = useTranslation();
	const w = useWorkspaceText();
	const [editing, setEditing] = useState<string | null>(null);
	const [editText, setEditText] = useState('');
	const [updateComment, { loading: updating }] = useMutation(UPDATE_COMMENT);
	const { language } = usePreferences();
	const locale =
		language === 'KR' ? 'ko-KR' : language === 'UZ' ? 'uz-UZ' : 'en-US';
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const [commentContent, setCommentContent] = useState('');
	const [formError, setFormError] = useState('');
	const input: CommentsInquiry = {
		page: 1,
		limit: 10,
		sort: 'createdAt',
		direction: 'DESC',
		search: { commentRefId: targetId },
	};
	const { data, loading, error } = useQuery<{
		getComments: { list: Comment[]; metaCounter: Array<{ total: number }> };
	}>(GET_COMMENTS, {
		variables: { input },
		skip:
			!/^[a-f\d]{24}$/i.test(targetId) ||
			!process.env.NEXT_PUBLIC_API_GRAPHQL_URL,
		fetchPolicy: 'cache-and-network',
	});
	const [createComment, { loading: creating }] = useMutation(CREATE_COMMENT);
	const comments = data?.getComments?.list ?? [];

	const saveComment = async (id: string, remove = false) => {
		if (
			updating ||
			(!remove && !editText.trim()) ||
			(remove && !window.confirm(w('confirmRemove')))
		)
			return;
		try {
			await updateComment({
				variables: {
					input: {
						_id: id,
						...(remove
							? { commentStatus: 'DELETED' }
							: { commentContent: editText.trim() }),
					},
				},
				refetchQueries: [{ query: GET_COMMENTS, variables: { input } }],
				awaitRefetchQueries: true,
			});
			setEditing(null);
			setFormError('');
		} catch {
			setFormError(t('comments.publishError'));
		}
	};

	const handleCreateComment = async (
		event: React.FormEvent<HTMLFormElement>,
	) => {
		event.preventDefault();
		if (!user._id) {
			await router.push(
				`/account/signin?redirect=${encodeURIComponent(router.asPath)}`,
			);
			return;
		}
		if (!commentContent.trim()) {
			setFormError(t('comments.required'));
			return;
		}
		try {
			const commentInput: CreateCommentInput = {
				commentGroup: group,
				commentContent: commentContent.trim(),
				commentRefId: targetId,
			};
			await createComment({
				variables: { input: commentInput },
				refetchQueries: [{ query: GET_COMMENTS, variables: { input } }],
				awaitRefetchQueries: true,
			});
			setCommentContent('');
			setFormError('');
		} catch (error) {
			setFormError(t('comments.publishError'));
		}
	};

	return (
		<section className="comments-section">
			<div className="section-heading">
				<div>
					<span className="eyebrow">{t('comments.kicker')}</span>
					<h2>
						{group === ReferenceGroup.DOCTOR
							? t('comments.doctorTitle')
							: group === ReferenceGroup.ARTICLE
								? t('comments.articleTitle')
								: t('comments.serviceTitle')}
					</h2>
				</div>
				<span className="comment-count">
					{t('comments.count').replace(
						'{count}',
						String(
							data?.getComments?.metaCounter?.[0]?.total ?? comments.length,
						),
					)}
				</span>
			</div>
			<form className="comment-form" onSubmit={handleCreateComment}>
				<label htmlFor={`${group}-comment`}>{t('comments.formLabel')}</label>
				<textarea
					id={`${group}-comment`}
					value={commentContent}
					onChange={(event) => setCommentContent(event.target.value)}
					maxLength={100}
					placeholder={t('comments.placeholder')}
					rows={4}
				/>
				<div className="comment-form-footer">
					{formError && <span className="form-error">{formError}</span>}
					<button
						className="button button-primary button-small"
						type="submit"
						disabled={creating}
					>
						{creating
							? t('comments.publishing')
							: user._id
								? t('comments.publish')
								: t('comments.signin')}
					</button>
				</div>
			</form>
			{loading && <span className="query-status">{t('comments.loading')}</span>}
			{error && (
				<span className="query-status">{t('comments.unavailable')}</span>
			)}
			{!loading && !error && comments.length === 0 && (
				<p className="comments-empty">{t('comments.empty')}</p>
			)}
			{comments.length > 0 && (
				<div className="comment-list">
					{comments.map((comment) => (
						<article className="comment-card" key={comment._id}>
							<div className="comment-card-header">
								<strong>
									{comment.doctorData?.docFullName ??
										comment.memberData?.memberFullName ??
										comment.memberData?.memberNick ??
										t('comments.memberFallback')}
								</strong>
								<time>
									{formatCommentDate(
										comment.createdAt,
										locale,
										t('comments.recently'),
									)}
								</time>
							</div>
							{editing === comment._id ? (
								<form
									onSubmit={(event) => {
										event.preventDefault();
										void saveComment(comment._id);
									}}
								>
									<textarea
										aria-label={w('content')}
										value={editText}
										onChange={(e) => setEditText(e.target.value)}
										maxLength={100}
										required
									/>
									<button type="submit" disabled={updating}>
										{w('save')}
									</button>
									<button type="button" onClick={() => setEditing(null)}>
										{w('cancel')}
									</button>
								</form>
							) : (
								<p>{comment.commentContent}</p>
							)}
							{user._id === comment.memberId && (
								<div>
									<button
										type="button"
										disabled={updating}
										onClick={() => {
											setEditing(comment._id);
											setEditText(comment.commentContent);
										}}
									>
										{w('edit')}
									</button>
									<button
										type="button"
										disabled={updating}
										onClick={() => void saveComment(comment._id, true)}
									>
										{w('remove')}
									</button>
								</div>
							)}
						</article>
					))}
				</div>
			)}
		</section>
	);
};

export default CommentsSection;
