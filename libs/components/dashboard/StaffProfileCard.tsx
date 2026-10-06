import { ReactNode } from 'react';
import Icon from '@/libs/components/common/Icon';
import { resolveApiAsset } from '@/libs/config';

const StaffProfileCard = ({ name, nickname, image, facts, children }: {
  name: string;
  nickname: string;
  image?: string;
  facts: { label: string; value: ReactNode }[];
  children: ReactNode;
}) => {
  const initials = name.trim().split(/\s+/).slice(0, 2).map((part) => part[0]).join('').toUpperCase();
  return <section className="clinical-staff-profile-card">
    <div className="clinical-staff-profile-identity">
      <span className="clinical-staff-profile-photo" style={image ? { backgroundImage: `url(${resolveApiAsset(image)})` } : undefined}>{image ? null : initials || <Icon name="person" />}</span>
      <h2>{name}</h2><p>@{nickname}</p>
      <div className="clinical-staff-profile-actions">{children}</div>
    </div>
    <dl className="clinical-staff-profile-facts">{facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value ?? '—'}</dd></div>)}</dl>
  </section>;
};

export default StaffProfileCard;
