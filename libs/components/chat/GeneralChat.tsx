import { FormEvent, useEffect, useRef, useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { getJwtToken } from '@/libs/auth/token';
import Icon from '@/libs/components/common/Icon';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { usePreferences } from '@/libs/components/preference/PreferenceProvider';
import { translate } from '@/libs/i18n/messages';
import { GeneralChatMessage, mergeGeneralChatMessages } from './generalChatMessages';

type ChatEvent =
  | { event: 'getMessages'; list: GeneralChatMessage[] }
  | { event: 'message'; data: GeneralChatMessage }
  | { event: 'messageSent'; requestId: string }
  | { event: 'info'; totalClients: number }
  | { event: 'error'; message: string; code?: string; requestId?: string };

export const socketAddress = (token: string) => {
  const source = process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_GRAPHQL_URL ?? 'http://localhost:2001';
  const url = new URL(source);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = '/';
  url.search = '';
  if (token) url.searchParams.set('token', token);
  return url.toString();
};

const GeneralChat = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const t = useTranslation();
  const { language } = usePreferences();
  const session = useReactiveVar(userVar);
  const [status, setStatus] = useState<'connecting' | 'connected' | 'disconnected'>('disconnected');
  const [messages, setMessages] = useState<GeneralChatMessage[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [online, setOnline] = useState<number | null>(null);
  const [sending, setSending] = useState(false);
  const pendingRequest = useRef<string | null>(null);
  const ackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const socket = useRef<WebSocket | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    let stopped = false;
    let retry: ReturnType<typeof setTimeout> | undefined;
    const connect = () => {
      setStatus('connecting');
      setSending(false);
      pendingRequest.current = null;
      const client = new WebSocket(socketAddress(session._id ? getJwtToken() : ''));
      const arrivedDuringHistory: GeneralChatMessage[] = [];
      let historyLoaded = false;
      socket.current = client;
      client.onopen = () => { if (!stopped) { setStatus('connected'); setError((current) => current === translate(language, 'chat.sendUnconfirmed') ? current : ''); } };
      client.onmessage = ({ data }) => {
        if (stopped) return;
        try {
          const packet = JSON.parse(String(data)) as ChatEvent;
          if (packet.event === 'getMessages') {
            setMessages(mergeGeneralChatMessages(packet.list, arrivedDuringHistory));
            historyLoaded = true;
            arrivedDuringHistory.length = 0;
          }
          if (packet.event === 'message') {
            if (!historyLoaded) {
              arrivedDuringHistory.push(packet.data);
              if (arrivedDuringHistory.length > 50) arrivedDuringHistory.shift();
            }
            setMessages((current) => mergeGeneralChatMessages(current, [packet.data]));
          }
          if (packet.event === 'messageSent' && packet.requestId === pendingRequest.current) {
            pendingRequest.current = null;
            if (ackTimer.current) clearTimeout(ackTimer.current);
            setSending(false); setText(''); setError('');
          }
          if (packet.event === 'info') setOnline(packet.totalClients);
          if (packet.event === 'error') {
            const errorKey = packet.code === 'GENERAL_HISTORY_UNAVAILABLE' ? 'chat.historyError'
              : packet.code === 'GENERAL_SEND_FAILED' ? 'chat.sendError'
              : packet.code === 'INVALID_GENERAL_MESSAGE' ? 'chat.invalidMessage' : null;
            setError(errorKey ? translate(language, errorKey) : packet.message);
            if (pendingRequest.current && (packet.requestId === pendingRequest.current || !packet.code)) {
              pendingRequest.current = null;
              if (ackTimer.current) clearTimeout(ackTimer.current);
              setSending(false);
            }
          }
        } catch { /* Ignore malformed frames; keep the conversation usable. */ }
      };
      client.onerror = () => { if (!stopped) setError(translate(language, 'chat.connectionError')); };
      client.onclose = () => {
        if (stopped) return;
        if (pendingRequest.current) setError(translate(language, 'chat.sendUnconfirmed'));
        pendingRequest.current = null;
        if (ackTimer.current) clearTimeout(ackTimer.current);
        setSending(false);
        setStatus('disconnected');
        retry = setTimeout(connect, 3000);
      };
    };
    connect();
    return () => { stopped = true; clearTimeout(retry); if (ackTimer.current) clearTimeout(ackTimer.current); pendingRequest.current = null; socket.current?.close(); socket.current = null; };
  }, [open, session._id, language]);

  useEffect(() => { if (open && !sending) input.current?.focus(); }, [open, sending]);
  useEffect(() => { bottom.current?.scrollIntoView({ block: 'nearest' }); }, [messages.length]);

  const send = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = text.trim();
    if (!content || sending || status !== 'connected' || socket.current?.readyState !== WebSocket.OPEN || content.length > 500) return;
    const requestId = window.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    pendingRequest.current = requestId;
    setSending(true);
    try {
      socket.current.send(JSON.stringify({ event: 'message', data: { text: content, requestId } }));
    } catch {
      pendingRequest.current = null; setSending(false); setError(t('chat.sendError')); return;
    }
    setError('');
    ackTimer.current = setTimeout(() => {
      if (pendingRequest.current !== requestId) return;
      pendingRequest.current = null; setSending(false); setError(t('chat.sendUnconfirmed'));
    }, 15000);
  };

  if (!open) return null;

  return <div className="clinical-chat-widget">
    {open && <section className="clinical-chat-panel" id="general-chat" aria-label={t('chat.title')}>
      <header><div><strong>{t('chat.title')}</strong><small>{status === 'connected' ? t('chat.connected') : status === 'connecting' ? t('chat.connecting') : t('chat.disconnected')}{online !== null ? ` · ${online} ${t('chat.online')}` : ''}</small></div><button type="button" onClick={onClose} aria-label={t('chat.close')}><Icon name="close" /></button></header>
      <div className="clinical-chat-history" role="log" aria-live="polite" aria-relevant="additions">
        {messages.length === 0 && <p className="clinical-chat-empty">{t('chat.empty')}</p>}
        {messages.map((message) => <article key={message.id}><div><strong>{message.role === 'GUEST' ? t('chat.guest') : message.name}</strong><time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleTimeString({ KR: 'ko-KR', UZ: 'uz-UZ', EN: 'en-US' }[language], { hour: '2-digit', minute: '2-digit' })}</time></div><p>{message.text}</p></article>)}
        <div ref={bottom} />
      </div>
      {error && <p className="clinical-chat-error" role="alert">{error}</p>}
      <form onSubmit={send}><input ref={input} value={text} disabled={sending} onChange={(event) => setText(event.target.value)} maxLength={500} placeholder={t('chat.placeholder')} aria-label={t('chat.placeholder')} /><button type="submit" disabled={sending || status !== 'connected' || !text.trim()} aria-label={t(sending ? 'chat.sending' : 'chat.send')}><Icon name={sending ? 'hourglass_top' : 'send'} /></button></form>
    </section>}
  </div>;
};

export default GeneralChat;
