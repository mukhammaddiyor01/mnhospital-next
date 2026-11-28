import { useState } from 'react';
import { usePreferences } from '@/libs/components/preference/PreferenceProvider';
import Icon from '@/libs/components/common/Icon';
import styles from './EximbayTestCard.module.scss';

export const EXIMBAY_TEST_CARD = {
	number: '4000000000000002',
	expiry: '12/33',
	cvc: '123',
	authentication: '111',
} as const;
const copy = {
	EN: {
		title: 'Eximbay test card',
		help: 'Choose Visa / Overseas in the Eximbay window and paste these test details. Eximbay requires you to enter them in its own payment form.',
		number: 'Card number',
		expiry: 'Expiry',
		cvc: 'CVC',
		authentication: 'Authentication code, if requested',
		copy: 'Copy',
		copied: 'Copied',
		failed: 'Select and copy the value manually.',
		source: 'Eximbay test guide',
	},
	UZ: {
		title: 'Eximbay test kartasi',
		help: 'Eximbay oynasida Visa / Overseas tanlab, ushbu test ma’lumotlarini kiriting. Ularni Eximbayning o‘z to‘lov formasiga kiritish kerak.',
		number: 'Karta raqami',
		expiry: 'Amal qilish muddati',
		cvc: 'CVC',
		authentication: 'Tasdiqlash kodi, so‘ralsa',
		copy: 'Nusxalash',
		copied: 'Nusxalandi',
		failed: 'Qiymatni belgilab, qo‘lda nusxalang.',
		source: 'Eximbay test qo‘llanmasi',
	},
	KR: {
		title: 'Eximbay 테스트 카드',
		help: 'Eximbay 결제창에서 Visa / 해외 결제를 선택하고 아래 테스트 정보를 입력하세요. 카드 정보는 Eximbay 결제창에 직접 입력해야 합니다.',
		number: '카드 번호',
		expiry: '유효기간',
		cvc: 'CVC',
		authentication: '인증 코드 (요청 시)',
		copy: '복사',
		copied: '복사됨',
		failed: '값을 선택하여 직접 복사하세요.',
		source: 'Eximbay 테스트 안내',
	},
};
export default function EximbayTestCard({
	mode,
}: {
	mode: string | undefined;
}) {
	const { language } = usePreferences(),
		text = copy[language];
	const [copied, setCopied] = useState(''),
		[failed, setFailed] = useState(false);
	if (mode !== 'SANDBOX') return null;
	const fields = [
		['number', text.number],
		['expiry', text.expiry],
		['cvc', text.cvc],
		['authentication', text.authentication],
	] as const;
	return (
		<section className={styles.panel} aria-label={text.title}>
			<h3>
				<Icon name="credit_card" />
				{text.title}
			</h3>
			<p>{text.help}</p>
			<div className={styles.fields}>
				{fields.map(([key, label]) => (
					<div className={styles.field} key={key}>
						<label>
							<span>{label}</span>
							<input
								readOnly
								value={EXIMBAY_TEST_CARD[key]}
								aria-label={label}
							/>
						</label>
						<button
							type="button"
							aria-label={`${text.copy}: ${label}`}
							onClick={async () => {
								try {
									await navigator.clipboard.writeText(EXIMBAY_TEST_CARD[key]);
									setCopied(key);
									setFailed(false);
								} catch {
									setFailed(true);
									setCopied('');
								}
							}}
						>
							<Icon name={copied === key ? 'check' : 'content_copy'} />
							<span>{copied === key ? text.copied : text.copy}</span>
						</button>
					</div>
				))}
			</div>
			<span role="status" className={failed ? styles.error : styles.srOnly}>
				{failed ? text.failed : copied ? text.copied : ''}
			</span>
			<a
				href="https://secureapi.test.eximbay.com/openapi/demo/eng/sandbox_test.jsp"
				target="_blank"
				rel="noreferrer"
			>
				{text.source}
			</a>
		</section>
	);
}
