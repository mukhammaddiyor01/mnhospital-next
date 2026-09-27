import { MemberAuthType, MemberStatus, MemberType } from '../enums/member.enum';

export interface Member {
	_id: string;
	memberType: MemberType | string;
	memberStatus: MemberStatus | string;
	memberAuthType: MemberAuthType | string;
	memberPhone: string;
	memberMail?: string;
	memberNick: string;
	memberFullName?: string;
	memberImage: string;
	memberDesc?: string;
	memberConversation: number;
	memberAddress: number;
	memberServices: number;
	memberArticles: number;
	memberFollowers: number;
	memberFollowings: number;
	memberLikes: number;
	memberViews: number;
	memberComments: number;
	memberPoints: number;
	memberRank: number;
	memberReports: number;
	meLiked?: Array<{ memberId: string; likeRefId: string; myFavorite: boolean }>;
	meFollowed?: Array<{ followerId: string; followingId: string; myFollowing: boolean }>;
	accessToken?: string;
	createdAt: string;
	updatedAt: string;
}

export type MemberSession = Partial<Member> & { _id: string; memberNick: string };
