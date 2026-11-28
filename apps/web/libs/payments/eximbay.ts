export interface EximbayCheckoutPayload {
	fgkey: string;
	payment: { transaction_type: string; order_id: string; currency: string; amount: string; lang: string };
	merchant: { mid: string };
	buyer: { name: string; email: string };
	url: { return_url: string; status_url: string };
	settings: { display_type: string };
}

export interface EximbaySdk {
	request_pay: (payload: EximbayCheckoutPayload) => void;
}

declare global { interface Window { EXIMBAY?: EximbaySdk; } }

export const getEximbaySdkUrl = (configured?: string) => {
	const url = configured ?? 'https://api-test.eximbay.com/v3/javascriptSDK.js';
	return url === 'https://api-test.eximbay.com/v3/javascriptSDK.js' ? url : '';
};

export const requestEximbayCheckout = (payload: EximbayCheckoutPayload, sdk: EximbaySdk | undefined, errorMessage: string) => {
	if (!sdk?.request_pay || !payload?.fgkey || !payload.merchant?.mid || !payload.payment?.order_id || payload.settings?.display_type !== 'R') {
		throw new Error(errorMessage);
	}
	const cleanPayload: EximbayCheckoutPayload = JSON.parse(JSON.stringify(payload, (key, value) => key === '__typename' ? undefined : value));
	sdk.request_pay(cleanPayload);
};
