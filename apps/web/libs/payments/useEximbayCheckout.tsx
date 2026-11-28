import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@apollo/client';
import { PREPARE_EXIMBAY } from '@/apollo/workspace/patientOperations';
import { useWorkspaceText } from '@/libs/components/workspace/useWorkspaceText';
import { EximbayCheckoutPayload, getEximbaySdkUrl, requestEximbayCheckout } from './eximbay';

const sdkUrl = getEximbaySdkUrl(process.env.NEXT_PUBLIC_EXIMBAY_SDK_URL);

export const useEximbayCheckout = (enabled: boolean) => {
	const w = useWorkspaceText();
	const [ready, setReady] = useState(false);
	const [failed, setFailed] = useState(false);
	const locked = useRef(false);
	const [prepare, state] = useMutation<{ prepareEximbayPayment: EximbayCheckoutPayload }>(PREPARE_EXIMBAY);
	useEffect(() => {
		setReady(enabled && Boolean(sdkUrl && window.EXIMBAY?.request_pay));
		setFailed(false);
	}, [enabled]);
	const openCheckout = async (paymentId: string) => {
		if (!ready || locked.current) throw new Error(w('paymentUnavailable'));
		locked.current = true;
		try {
			const result = await prepare({ variables: { input: { paymentId } } });
			if (!result.data) throw new Error(w('paymentUnavailable'));
			requestEximbayCheckout(result.data.prepareEximbayPayment, window.EXIMBAY, w('paymentUnavailable'));
		} finally { locked.current = false; }
	};
	return {
		ready, loading: state.loading, openCheckout,
		error: enabled && (failed || !sdkUrl) ? w('paymentUnavailable') : '',
		script: enabled && sdkUrl ? <Script id="mn-eximbay-checkout-sdk" src={sdkUrl}
			onReady={() => { setReady(Boolean(window.EXIMBAY?.request_pay)); setFailed(!window.EXIMBAY?.request_pay); }}
			onError={() => { setReady(false); setFailed(true); }} /> : null,
	};
};
