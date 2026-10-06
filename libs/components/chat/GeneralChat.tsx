import { FormEvent, useEffect, useRef, useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import { getJwtToken } from '@/libs/auth/token';
import Icon from '@/libs/components/common/Icon';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { usePreferences } from '@/libs/components/preference/PreferenceProvider';
import { translate } from '@/libs/i18n/messages';

type ChatMessage = { id: string; text: string; name: string; role: string; createdAt: string };
type ChatEvent =
  | { event: 'getMessages'; list: ChatMessage[] }
  | { event: 'message'; data: ChatMessage }
  | { event: 'info'; totalClients: number }
  | { event: 'error'; message: string };

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
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [online, setOnline] = useState<number | null>(null);
  const socket = useRef<WebSocket | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    let stopped = false;
    let retry: ReturnType<typeof setTimeout> | undefined;
    const connect = () => {
      setStatus('connecting');
      const client = new WebSocket(socketAddress(session._id ? getJwtToken() : ''));
      socket.current = client;
      client.onopen = () => { if (!stopped) { setStatus('connected'); setError(''); } };
      client.onmessage = ({ data }) => {
        if (stopped) return;
        try {
          const packet = JSON.parse(String(data)) as ChatEvent;
          if (packet.event === 'getMessages') setMessages(packet.list.slice(-50));
          if (packet.event === 'message') setMessages((current) => [...current, packet.data].slice(-50));
          if (packet.event === 'info') setOnline(packet.totalClients);
          if (packet.event === 'error') setError(packet.message);
        } catch { /* Ignore malformed frames; keep the conversation usable. */ }
      };
      client.onerror = () => { if (!stopped) setError(translate(language, 'chat.connectionError')); };
      client.onclose = () => {
        if (stopped) return;
        setStatus('disconnected');
        retry = setTimeout(connect, 3000);
      };
    };
    connect();
    return () => { stopped = true; clearTimeout(retry); socket.current?.close(); socket.current = null; };
  }, [open, session._id, language]);

  useEffect(() => { if (open) input.current?.focus(); }, [open]);
  useEffect(() => { bottom.current?.scrollIntoView({ block: 'nearest' }); }, [messages.length]);

  const send = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const content = text.trim();
    if (!content || status !== 'connected' || !socket.current || content.length > 500) return;
    socket.current.send(JSON.stringify({ event: 'message', data: { text: content } }));
    setText('');
    setError('');
  };

  if (!open) return null;

  return <div className="clinical-chat-widget">
    {open && <section className="clinical-chat-panel" id="general-chat" aria-label={t('chat.title')}>
      <header><div><strong>{t('chat.title')}</strong><small>{status === 'connected' ? t('chat.connected') : status === 'connecting' ? t('chat.connecting') : t('chat.disconnected')}{online !== null ? ` · ${online} ${t('chat.online')}` : ''}</small></div><button type="button" onClick={onClose} aria-label={t('chat.close')}><Icon name="close" /></button></header>
      <div className="clinical-chat-history" role="log" aria-live="polite" aria-relevant="additions">
        {messages.length === 0 && <p className="clinical-chat-empty">{t('chat.empty')}</p>}
        {messages.map((message) => <article key={message.id}><div><strong>{message.role === 'GUEST' ? t('chat.guest') : message.name}</strong><time dateTime={message.createdAt}>{new Date(message.createdAt).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</time></div><p>{message.text}</p></article>)}
        <div ref={bottom} />
      </div>
      {error && <p className="clinical-chat-error" role="alert">{error}</p>}
      <form onSubmit={send}><input ref={input} value={text} onChange={(event) => setText(event.target.value)} maxLength={500} placeholder={t('chat.placeholder')} aria-label={t('chat.placeholder')} /><button type="submit" disabled={status !== 'connected' || !text.trim()} aria-label={t('chat.send')}><Icon name="send" /></button></form>
    </section>}
  </div>;
};

export default GeneralChat;
