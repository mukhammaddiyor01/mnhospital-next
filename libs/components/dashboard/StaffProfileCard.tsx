import { ReactNode } from 'react';
import Icon from '@/libs/components/common/Icon';
import ProfileAvatar from '@/libs/components/common/ProfileAvatar';

const StaffProfileCard = ({ name, nickname, image, facts, heading, roleLabel, connections, navigation, children }: {
  name: string;
  nickname: string;
  image?: string;
  facts: { label: string; value: ReactNode; wide?: boolean }[];
  heading: string;
  roleLabel: string;
  connections?: ReactNode;
  navigation?: ReactNode;
  children: ReactNode;
}) => {
  return <section className="clinical-staff-profile-card">
    <div className="clinical-staff-profile-identity">
      <ProfileAvatar className="clinical-staff-profile-photo" image={image} name={name} />
      <div className="mn-profile-name"><h2>{name}</h2><p>@{nickname}<span className="mn-profile-role">{roleLabel}</span></p>{connections}</div>
      <div className="clinical-staff-profile-actions">{children}</div>
    </div>
    {navigation}
    <div className="mn-profile-details" id="account-details">
      <h3>{heading}</h3>
      <dl className="clinical-staff-profile-facts">{facts.map((fact) => <div className={fact.wide ? 'mn-profile-fact-wide' : undefined} key={fact.label}><dt>{fact.label}</dt><dd>{fact.value ?? '—'}</dd></div>)}</dl>
    </div>
  </section>;
};

export default StaffProfileCard;
