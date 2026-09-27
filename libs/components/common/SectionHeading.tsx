import Link from 'next/link';

interface SectionHeadingProps {
	eyebrow?: string;
	title: string;
	description?: string;
	linkLabel?: string;
	linkHref?: string;
}

const SectionHeading = ({ eyebrow, title, description, linkLabel, linkHref }: SectionHeadingProps) => (
	<div className="section-heading">
		<div>
			{eyebrow && <span className="eyebrow">{eyebrow}</span>}
			<h2>{title}</h2>
			{description && <p>{description}</p>}
		</div>
		{linkLabel && linkHref && (
			<Link className="text-link" href={linkHref}>
				{linkLabel}<span>↗</span>
			</Link>
		)}
	</div>
);

export default SectionHeading;
