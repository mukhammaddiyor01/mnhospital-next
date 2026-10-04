import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormEvent } from 'react';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { resolveApiAsset } from '@/libs/config';
import { MemberType } from './member/enums/member.enum';
import MnLogo from './common/MnLogo';
import AnimatedWave from './common/AnimatedWave';

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
				<MnLogo />
				<nav className="clinical-desktop-navigation" aria-label="Main navigation"><Link className={router.pathname.startsWith('/article') ? 'active' : ''} href="/article">Articles</Link></nav>
				{isHome ? <form className="clinical-header-search" onSubmit={searchHandler}><img className="clinical-search-mark" src="/img/mn-logo-mark.png" alt="" width={24} height={20} /><input name="globalSearch" placeholder="Search doctors, treatments, services..." aria-label="Search doctors, treatments, services" /></form> : null}
				<div className="clinical-header-actions"><Link className="clinical-book-top" href="/appointment">Book an Appointment</Link>{user._id ? <Link className="clinical-profile" href={user.memberType === MemberType.DOCTOR ? `/doctor/${user._id}` : '/mypage'} aria-label="Open my profile" title="My profile" style={user.memberImage ? { backgroundImage: `url(${resolveApiAsset(user.memberImage)})` } : undefined}><span>{initials}</span></Link> : <Link className="clinical-signup-top" href="/account/join">Sign Up</Link>}</div>
			</div>
			<AnimatedWave variant="header" />
		</header>
	);
};

export default Top;
