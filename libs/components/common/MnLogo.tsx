import Link from 'next/link';

const MnLogo = ({ footer = false }: { footer?: boolean }) => <Link className={`mn-logo${footer ? ' mn-logo--footer' : ''}`} href="/" aria-label="MN Hospital home">
	<img className="mn-logo__mark" src="/img/mn-logo-mark.png" alt="" width={64} height={40} />
	<span className="mn-logo__name">MN Hospital</span>
</Link>;

export default MnLogo;
