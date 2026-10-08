import { ReactNode } from 'react';
import Icon from '@/libs/components/common/Icon';
import ProfileAvatar from '@/libs/components/common/ProfileAvatar';

const StaffProfileCard = ({ name, nickname, image, facts, children }: {
  name: string;
  nickname: string;
  image?: string;
  facts: { label: string; value: ReactNode }[];
  children: ReactNode;
}) => {
  return <section className="clinical-staff-profile-card">
    <div className="clinical-staff-profile-identity">
      <ProfileAvatar className="clinical-staff-profile-photo" image={image} name={name} />
      <h2>{name}</h2><p>@{nickname}</p>
      <div className="clinical-staff-profile-actions">{children}</div>
    </div>
    <dl className="clinical-staff-profile-facts">{facts.map((fact) => <div key={fact.label}><dt>{fact.label}</dt><dd>{fact.value ?? '—'}</dd></div>)}</dl>
  </section>;
};

export default StaffProfileCard;
