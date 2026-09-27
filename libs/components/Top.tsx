import Link from 'next/link';
import { useRouter } from 'next/router';
import { FormEvent } from 'react';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { logOut } from '@/libs/auth';

const Top = () => {
	const router = useRouter();
	const user = useReactiveVar(userVar);

	const searchHandler = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const input = event.currentTarget.elements.namedItem('globalSearch') as HTMLInputElement;
		void router.push(input.value.trim() ? `/doctor?search=${encodeURIComponent(input.value.trim())}` : '/doctor');
	};
	const initials = user.memberFullName?.split(' ').map((part) => part[0]).join('').slice(0, 2) || 'MK';

	return (
		<header className="clinical-header">
			<div className="clinical-header-inner">
				<Link className="clinical-brand" href="/"><span className="clinical-brand-icon">+</span><span><strong>MN Hospital</strong><small>Clinical Care</small></span></Link>
				<form className="clinical-header-search" onSubmit={searchHandler}><span>⌕</span><input name="globalSearch" placeholder="Search doctors, treatments, services..." aria-label="Search doctors, treatments, services" /></form>
				<div className="clinical-header-actions"><Link className="clinical-book-top" href="/appointment">Book appointment</Link>{user._id ? <button className="clinical-profile" title="Log out" onClick={logOut}>{initials}</button> : <Link className="clinical-profile" href="/account/signin">{initials}</Link>}</div>
			</div>
		</header>
	);
};

export default Top;
