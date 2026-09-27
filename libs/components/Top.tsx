import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormEvent } from 'react';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import Icon from './common/Icon';

const Top = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);
	const isHome = router.pathname === '/';

	const searchHandler = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const input = event.currentTarget.elements.namedItem('globalSearch') as HTMLInputElement;
		void router.push(input.value.trim() ? `/doctor?search=${encodeURIComponent(input.value.trim())}` : '/doctor');
	};
	const initials = user.memberFullName?.split(' ').map((part) => part[0]).join('').slice(0, 2) || user.memberNick?.slice(0, 2).toUpperCase() || 'MN';

	return (
		<header className={`clinical-header ${isHome ? 'has-search' : ''}`}>
			<div className="clinical-header-inner">
				<Link className="clinical-brand" href="/"><span className="clinical-brand-icon"><Icon name="local_hospital" /></span><span><strong>MN Hospital</strong><small>Clinical Care</small></span></Link>
				{isHome ? <form className="clinical-header-search" onSubmit={searchHandler}><span>⌕</span><input name="globalSearch" placeholder="Search doctors, treatments, services..." aria-label="Search doctors, treatments, services" /></form> : null}
				<div className="clinical-header-actions"><Link className="clinical-book-top" href="/appointment">Book an Appointment</Link>{user._id ? <Link className="clinical-profile" href="/mypage" aria-label="Open my patient profile" title="My profile" style={user.memberImage ? { backgroundImage: `url(${user.memberImage})` } : undefined}><span>{initials}</span></Link> : <Link className="clinical-signup-top" href="/account/join">Sign Up</Link>}</div>
			</div>
		</header>
	);
};

export default Top;
