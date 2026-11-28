import { AdvertisementStatus } from '../enums/advertisement.enum';

export interface Advertisement {
	_id: string;
	advertisementStatus?: AdvertisementStatus;
	advertisementTitle: string;
	advertisementContent: string;
	advertisementImage?: string;
	advertisementLink?: string;
	createdAt?: string;
	updatedAt?: string;
}

export interface AdvertisementPreview extends Advertisement {
	previewLabel?: string;
	previewRank?: string;
	previewPrice?: number;
	previewOriginalPrice?: number;
	previewViews?: number;
	previewReads?: number;
	previewDiscount?: string;
	previewAction?: string;
}

export interface AdvertisementsInquiry {
	page: number;
	limit: number;
}
