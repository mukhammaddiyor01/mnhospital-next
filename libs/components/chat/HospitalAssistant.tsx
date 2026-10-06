import { FormEvent, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useMutation } from '@apollo/client';
import { ASK_HOSPITAL_ASSISTANT } from '@/apollo/ai-chat/mutation';
import { usePreferences } from '@/libs/components/preference/PreferenceProvider';
import { useTranslation } from '@/libs/i18n/useTranslation';
import Icon from '@/libs/components/common/Icon';

type Reply = { status: 'READY' | 'NOT_CONFIGURED' | 'UNAVAILABLE' | 'RATE_LIMITED'; text?: string };
type Turn = { id: number; role: 'user' | 'assistant'; text: string };

const HospitalAssistant = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const t = useTranslation();
  const { language } = usePreferences();
  const [ask] = useMutation<{ askHospitalAssistant: Reply }>(ASK_HOSPITAL_ASSISTANT);
  const [text, setText] = useState('');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [status, setStatus] = useState<Reply['status'] | 'NETWORK' | null>(null);
  const [sending, setSending] = useState(false);
  const pending = useRef(false);
  const sequence = useRef(0);
  const input = useRef<HTMLInputElement>(null);
  const bottom = useRef<HTMLDivElement>(null);

  useEffect(() => { if (open && !sending) input.current?.focus(); }, [open, sending]);
  useEffect(() => { if (open) bottom.current?.scrollIntoView({ block: 'nearest' }); }, [open, turns.length, sending]);
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const send = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const question = text.trim();
    if (!question || question.length > 1000 || pending.current) return;
    pending.current = true;
    setSending(true); setStatus(null);
    try {
      const result = await ask({ variables: { input: { text: question, language } } });
      const reply = result.data?.askHospitalAssistant;
      if (reply?.status !== 'READY' || !reply.text) {
        setStatus(reply?.status === 'READY' ? 'UNAVAILABLE' : reply?.status ?? 'NETWORK');
        return;
      }
      const questionId = ++sequence.current;
      const answerId = ++sequence.current;
      setTurns((current) => [...current, { id: questionId, role: 'user' as const, text: question }, { id: answerId, role: 'assistant' as const, text: reply.text! }].slice(-40));
      setText('');
    } catch { setStatus('NETWORK'); }
    finally { pending.current = false; setSending(false); }
  };

  if (!open) return null;
  const errorKey = status === 'NOT_CONFIGURED' ? 'assistant.notConfigured' : status === 'RATE_LIMITED' ? 'assistant.rateLimited' : 'assistant.unavailable';
  return <div className="clinical-chat-widget">
    <section className="clinical-chat-panel clinical-assistant-panel" id="hospital-assistant" aria-label={t('assistant.title')}>
      <header><div><strong>{t('assistant.title')}</strong><small>{t('assistant.subtitle')}</small></div><button type="button" onClick={onClose} aria-label={t('chat.close')}><Icon name="close" /></button></header>
      <div className="clinical-chat-history" role="log" aria-live="polite" aria-relevant="additions">
        {turns.length === 0 && <p className="clinical-chat-empty">{t('assistant.welcome')}</p>}
        {turns.map((turn) => <article className={turn.role === 'user' ? 'clinical-assistant-question' : ''} key={turn.id}><strong>{t(turn.role === 'user' ? 'assistant.you' : 'assistant.title')}</strong><p>{turn.text}</p></article>)}
        {sending && <p role="status" className="clinical-chat-empty">{t('assistant.thinking')}</p>}
        <div ref={bottom} />
      </div>
      <div className="clinical-assistant-help">
        {status && <p className="clinical-chat-error" role="alert">{t(errorKey)}</p>}
        <p>{t('assistant.notice')}</p>
        <nav aria-label={t('assistant.shortcuts')}><Link href="/service">{t('nav.services')}</Link><Link href="/doctor">{t('nav.doctors')}</Link><Link href="/appointment">{t('nav.appointments')}</Link><Link href="/contact">{t('nav.contact')}</Link></nav>
      </div>
      <form onSubmit={send}><input ref={input} disabled={sending} value={text} onChange={(event) => setText(event.target.value)} maxLength={1000} placeholder={t('assistant.placeholder')} aria-label={t('assistant.placeholder')} /><button type="submit" disabled={sending || !text.trim()} aria-label={t('chat.send')}><Icon name={sending ? 'hourglass_top' : 'send'} /></button></form>
    </section>
  </div>;
};

export default HospitalAssistant;
