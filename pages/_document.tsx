import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
	return (
		<Html lang="en">
			<Head>
				<script dangerouslySetInnerHTML={{ __html: "try{var t=localStorage.getItem('mn-hospital-theme');var d=t==='DARK'||(t==='SYSTEM'&&matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.dataset.theme=d?'dark':'light';document.documentElement.style.colorScheme=d?'dark':'light';var l=localStorage.getItem('mn-hospital-language');document.documentElement.lang=l==='KR'?'ko':l==='UZ'?'uz':'en'}catch(e){}" }} />
				<link rel="preconnect" href="https://fonts.googleapis.com" />
				<link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
				<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Manrope:wght@600;700;800&family=Material+Symbols+Rounded" rel="stylesheet" />
			</Head>
			<body>
				<Main />
				<NextScript />
			</body>
		</Html>
	);
}
