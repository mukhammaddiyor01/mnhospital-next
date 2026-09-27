import { CommentStatus, ReferenceGroup } from '../enums/comment.enum';

export interface Comment {
	_id: string;
	commentStatus: CommentStatus;
	commentGroup: ReferenceGroup;
	commentContent: string;
	commentRefId: string;
	memberId: string;
	createdAt: string;
	updatedAt: string;
	memberData?: { memberNick: string; memberFullName?: string; memberImage?: string };
}

export interface CommentsInquiry {
	page: number;
	limit: number;
	sort?: string;
	direction?: 'ASC' | 'DESC';
	search: { commentRefId: string };
}
