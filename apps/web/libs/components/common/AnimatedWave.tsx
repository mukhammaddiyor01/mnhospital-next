const wavePath = 'M0 22 C120 8 240 8 360 22 S600 36 720 22 S960 8 1080 22 S1320 36 1440 22 S1680 8 1800 22 S2040 36 2160 22 S2400 8 2520 22 S2760 36 2880 22 V64 H0 Z';

const AnimatedWave = ({ variant }: { variant: 'header' | 'footer' }) => <div className={`clinical-animated-wave clinical-animated-wave--${variant}`} aria-hidden="true">
	<svg viewBox="0 0 1440 64" preserveAspectRatio="none" focusable="false">
		<path className="clinical-wave-layer clinical-wave-layer--back" d={wavePath} />
		<path className="clinical-wave-layer clinical-wave-layer--middle" d={wavePath} />
		<path className="clinical-wave-layer clinical-wave-layer--front" d={wavePath} />
	</svg>
</div>;

export default AnimatedWave;
