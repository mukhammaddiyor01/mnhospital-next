import { ReactNode } from 'react';
import Link from 'next/link';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import StaffLayout from '@/libs/components/layout/StaffLayout';
import StaffWorkspace from '@/libs/components/dashboard/StaffWorkspace';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { useWorkspaceText } from './useWorkspaceText';
export default function WorkspacePage({ role, title, children }: { role: MemberType; title: string; children: ReactNode }) {
 const session = useReactiveVar(userVar); const w = useWorkspaceText();
 const href = role === MemberType.ADMIN ? '/account/admin-signin' : role === MemberType.DOCTOR ? '/account/doctor-signin' : '/account/receptionist-signin';
 return <StaffLayout>{session._id && session.memberType === role && role !== MemberType.PATIENT ? <StaffWorkspace role={role as MemberType.ADMIN | MemberType.DOCTOR | MemberType.RECEPTIONIST} name={session.memberFullName || session.memberNick} title={title}>{children}</StaffWorkspace> : <main className="clinical-staff-gate"><h1>{w('session')}</h1><Link href={href}>{w('approve')}</Link></main>}</StaffLayout>;
}
