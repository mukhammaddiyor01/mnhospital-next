interface IconProps {
	name: string;
	className?: string;
}

const Icon = ({ name, className = '' }: IconProps) => {
	return <span className={`material-symbols-rounded ${className}`.trim()} aria-hidden="true">{name}</span>;
};

export default Icon;
