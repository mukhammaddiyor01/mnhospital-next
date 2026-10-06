import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useMutation, useQuery, useReactiveVar } from '@apollo/client';
import withLayoutMain from '@/libs/components/layout/LayoutHome';
import { userVar } from '@/apollo/store';
import { GET_MY_CONVERSATIONS, GET_MY_MESSAGES } from '@/apollo/messaging/query';
import { MARK_MY_MESSAGES_READ, SEND_DIRECT_MESSAGE, START_DIRECT_CONVERSATION } from '@/apollo/messaging/mutation';
import { ChatConversation, ChatMessage } from '@/libs/components/messaging/types';
import { MemberType } from '@/libs/components/member/enums/member.enum';
import { getJwtToken } from '@/libs/auth/token';
import { socketAddress } from '@/libs/components/chat/GeneralChat';
import { useTranslation } from '@/libs/i18n/useTranslation';

const PAGE_SIZE = 20;
const memberTypes = Object.values(MemberType);

export const MessagesPage = ({ embedded = false }: { embedded?: boolean }) => {
  const t = useTranslation();
  const router = useRouter();
  const session = useReactiveVar(userVar);
  useEffect(() => { if (session.memberType === MemberType.ADMIN && !embedded) void router.replace('/mypage/dashboard'); }, [router, session.memberType, embedded]);
  const [selectedId, setSelectedId] = useState('');
  const [draft, setDraft] = useState('');
  const [error, setError] = useState('');
  const [conversationPage, setConversationPage] = useState(1);
  const [messagePage, setMessagePage] = useState(1);
  const bottom = useRef<HTMLDivElement>(null);
  const selectedRef = useRef('');
  const targetId = typeof router.query.targetId === 'string' ? router.query.targetId : '';
  const targetType = typeof router.query.targetType === 'string' && memberTypes.includes(router.query.targetType as MemberType)
    ? router.query.targetType as MemberType : null;

  const conversations = useQuery<{ getMyConversations: { list: ChatConversation[]; total: number } }>(GET_MY_CONVERSATIONS, {
    variables: { input: { page: 1, limit: PAGE_SIZE } }, skip: !session._id || (session.memberType === MemberType.ADMIN && !embedded), fetchPolicy: 'cache-and-network',
  });
  const messages = useQuery<{ getMyMessages: { list: ChatMessage[]; total: number } }>(GET_MY_MESSAGES, {
    variables: { conversationId: selectedId, input: { page: 1, limit: PAGE_SIZE } }, skip: !session._id || (session.memberType === MemberType.ADMIN && !embedded) || !selectedId, fetchPolicy: 'cache-and-network',
  });
  const [startConversation, startState] = useMutation(START_DIRECT_CONVERSATION);
  const [sendMessage, sendState] = useMutation(SEND_DIRECT_MESSAGE);
  const [markRead] = useMutation(MARK_MY_MESSAGES_READ);

  const list = conversations.data?.getMyConversations.list ?? [];
  const active = list.find((item) => item._id === selectedId);
  const participant = (item: ChatConversation) => item.participants.find((person) => person.participantId !== session._id || person.participantType !== session.memberType) ?? item.participants[0];
  const label = (item: ChatConversation) => participant(item)?.displayName || t('messages.member');
  const rows = (messages.data?.getMyMessages.list ?? []).slice().reverse();

  useEffect(() => { selectedRef.current = selectedId; }, [selectedId]);
  useEffect(() => { if (rows.length) bottom.current?.scrollIntoView({ block: 'nearest' }); }, [selectedId, rows.length]);

  useEffect(() => {
    if (!session._id || (session.memberType === MemberType.ADMIN && !embedded)) return;
    const token = getJwtToken();
    if (!token) return;
    let stopped = false;
    let retry: ReturnType<typeof setTimeout> | undefined;
    let socket: WebSocket;
    const connect = () => {
      socket = new WebSocket(socketAddress(token));
      socket.onopen = () => { if (!stopped) { void conversations.refetch(); if (selectedRef.current) void messages.refetch(); } };
      socket.onmessage = ({ data }) => {
        if (stopped) return;
        try {
          const packet = JSON.parse(String(data)) as { event?: string; data?: { conversationId?: string } };
          if (packet.event !== 'privateMessage' && packet.event !== 'privateRead') return;
          void conversations.refetch();
          if (packet.data?.conversationId === selectedRef.current) {
            void messages.refetch();
            if (packet.event === 'privateMessage') void markRead({ variables: { conversationId: selectedRef.current } });
          }
        } catch { /* Ignore invalid socket frames. */ }
      };
      socket.onclose = () => { if (!stopped) retry = setTimeout(connect, 3000); };
    };
    connect();
    return () => { stopped = true; clearTimeout(retry); socket?.close(); };
  // Reconnect on a conversation change so callbacks use its current GraphQL variables.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session._id, session.memberType, selectedId, embedded]);

  const openConversation = (id: string) => {
    setSelectedId(id);
    setMessagePage(1);
    setError('');
    void markRead({ variables: { conversationId: id } });
  };

  const start = async () => {
    if (!targetType || !targetId) return;
    setError('');
    try {
      const response = await startConversation({ variables: { input: { targetType, targetId } } });
      const id = response.data?.startDirectConversation?._id as string | undefined;
      if (!id) throw new Error(t('messages.startError'));
      await conversations.refetch();
      openConversation(id);
      const workspace = session.memberType === MemberType.DOCTOR ? '/doctor-workspace' : session.memberType === MemberType.RECEPTIONIST ? '/receptionist-workspace' : '/admin';
      void router.replace(embedded ? `${workspace}/messages` : '/mypage/messages', undefined, { shallow: true });
    } catch (requestError: any) { setError(requestError?.message ?? t('messages.startError')); }
  };

  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const messageContent = draft.trim();
    if (!selectedId || !messageContent || messageContent.length > 2000) return;
    setError('');
    try {
      await sendMessage({ variables: { conversationId: selectedId, input: { messageContent } } });
      setDraft('');
      await Promise.all([messages.refetch(), conversations.refetch()]);
    } catch (requestError: any) { setError(requestError?.message ?? t('messages.sendError')); }
  };

  const loadConversations = async () => {
    const next = conversationPage + 1;
    try {
      await conversations.fetchMore({ variables: { input: { page: next, limit: PAGE_SIZE } }, updateQuery: (previous, { fetchMoreResult }) => ({
        getMyConversations: { total: fetchMoreResult.getMyConversations.total, list: [...previous.getMyConversations.list, ...fetchMoreResult.getMyConversations.list.filter((item: ChatConversation) => !previous.getMyConversations.list.some((old) => old._id === item._id))] },
      }) });
      setConversationPage(next);
    } catch (requestError: any) { setError(requestError?.message ?? t('messages.loadError')); }
  };

  const loadMessages = async () => {
    const next = messagePage + 1;
    try {
      await messages.fetchMore({ variables: { conversationId: selectedId, input: { page: next, limit: PAGE_SIZE } }, updateQuery: (previous, { fetchMoreResult }) => ({
        getMyMessages: { total: fetchMoreResult.getMyMessages.total, list: [...previous.getMyMessages.list, ...fetchMoreResult.getMyMessages.list.filter((item: ChatMessage) => !previous.getMyMessages.list.some((old) => old._id === item._id))] },
      }) });
      setMessagePage(next);
    } catch (requestError: any) { setError(requestError?.message ?? t('messages.loadError')); }
  };

  if (session.memberType === MemberType.ADMIN && !embedded) return null;

  return <div className="clinical-inner-page">
    {!embedded && <section className="clinical-inner-hero"><div><div className="clinical-crumb"><Link href="/">{t('page.home')}</Link> / <Link href="/mypage">{t('page.profile')}</Link> / {t('messages.title')}</div><span className="clinical-eyebrow">{t('messages.kicker')}</span><h1>{t('messages.title')}</h1><p>{t('messages.intro')}</p></div></section>}
    {!session._id ? <section className="clinical-inner-section clinical-auth-gate"><h2>{t('messages.signinTitle')}</h2><p>{t('messages.signinIntro')}</p><Link className="clinical-primary-button" href="/account/signin">{t('patient.signin')}</Link></section> :
      <section className="clinical-inner-section clinical-messages-layout">
        <aside className="clinical-messages-list"><div className="clinical-messages-heading"><h2>{t('messages.conversations')}</h2><small>{conversations.data?.getMyConversations.total ?? 0}</small></div>
          {targetId && targetType && <button className="clinical-messages-start" type="button" disabled={startState.loading} onClick={() => void start()}>{startState.loading ? t('messages.starting') : t('messages.start')}</button>}
          {conversations.loading && !list.length && <p className="clinical-query-status">{t('messages.loading')}</p>}
          {conversations.error && <p className="clinical-form-error">{t('messages.loadError')}</p>}
          {!conversations.loading && !list.length && !conversations.error && <p className="clinical-messages-empty">{t('messages.noConversations')}</p>}
          {list.map((item) => <button key={item._id} className={`clinical-messages-conversation ${item._id === selectedId ? 'active' : ''}`} type="button" onClick={() => openConversation(item._id)} aria-pressed={item._id === selectedId}><strong>{label(item)}</strong><small>{participant(item)?.participantType} {item.lastMessageAt ? `· ${new Date(item.lastMessageAt).toLocaleDateString()}` : ''}</small></button>)}
          {list.length < (conversations.data?.getMyConversations.total ?? 0) && <button className="clinical-messages-more" type="button" onClick={() => void loadConversations()}>{t('messages.loadMore')}</button>}
        </aside>
        <div className="clinical-messages-thread">{selectedId ? <>
          <header><h2>{active ? label(active) : t('messages.conversation')}</h2><small>{active ? participant(active)?.participantType : ''}</small></header>
          <div className="clinical-messages-history" role="log" aria-live="polite">
            {(messages.data?.getMyMessages.list.length ?? 0) < (messages.data?.getMyMessages.total ?? 0) && <button className="clinical-messages-more" type="button" onClick={() => void loadMessages()}>{t('messages.older')}</button>}
            {messages.loading && !rows.length && <p className="clinical-query-status">{t('messages.loading')}</p>}
            {messages.error && <p className="clinical-form-error">{t('messages.loadError')}</p>}
            {!messages.loading && !rows.length && !messages.error && <p className="clinical-messages-empty">{t('messages.noMessages')}</p>}
            {rows.map((message) => <article key={message._id} className={message.senderId === session._id && message.senderType === session.memberType ? 'own' : ''}><p>{message.messageContent}</p><time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleString()}</time></article>)}<div ref={bottom} />
          </div>
          <form className="clinical-messages-compose" onSubmit={send}><label htmlFor="private-message">{t('messages.compose')}</label><div><input id="private-message" value={draft} onChange={(event) => setDraft(event.target.value)} maxLength={2000} placeholder={t('messages.placeholder')} /><button className="clinical-primary-button" type="submit" disabled={sendState.loading || !draft.trim()}>{sendState.loading ? t('messages.sending') : t('messages.send')}</button></div></form>
        </> : <div className="clinical-messages-unselected"><h2>{t('messages.selectTitle')}</h2><p>{t('messages.selectIntro')}</p></div>}</div>
        {error && <p className="clinical-form-error clinical-messages-error" role="alert">{error}</p>}
      </section>}
  </div>;
};

export default withLayoutMain(MessagesPage);
