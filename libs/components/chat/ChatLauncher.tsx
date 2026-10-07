import Icon from '@/libs/components/common/Icon';
import BackToTop from '@/libs/components/common/BackToTop';
import { useTranslation } from '@/libs/i18n/useTranslation';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/router';

const ChatLauncher = ({
  chatOpen,
  assistantOpen,
  onChatToggle,
  onAssistantToggle,
}: {
  chatOpen: boolean;
  assistantOpen: boolean;
  onChatToggle: () => void;
  onAssistantToggle?: () => void;
}) => {
  const t = useTranslation();
  const { asPath } = useRouter();
  const [railSlot, setRailSlot] = useState<HTMLElement | null>(null);
  useEffect(() => {
    const desktop = window.matchMedia('(min-width: 901px)');
    const updateSlot = () => setRailSlot(desktop.matches ? document.getElementById('clinical-rail-chat-slot') : null);
    updateSlot();
    desktop.addEventListener('change', updateSlot);
    return () => desktop.removeEventListener('change', updateSlot);
  }, [asPath]);
  const controls = (
    <div className={`clinical-chat-launchers${railSlot ? ' is-docked' : ''}`}>
      <BackToTop />
      <button
        type="button"
        className={chatOpen ? 'active' : ''}
        aria-label={t(chatOpen ? 'chat.close' : 'chat.open')}
        aria-expanded={chatOpen}
        aria-controls="general-chat"
        onClick={onChatToggle}
      >
        <Icon name={chatOpen ? 'close' : 'chat_bubble'} />
        <span>{t('chat.open')}</span>
      </button>
      {onAssistantToggle && (
        <button
          type="button"
          className={assistantOpen ? 'active clinical-assistant-launcher' : 'clinical-assistant-launcher'}
          aria-label={t(assistantOpen ? 'chat.close' : 'assistant.open')}
          aria-expanded={assistantOpen}
          aria-controls="hospital-assistant"
          onClick={onAssistantToggle}
        >
          <Icon name={assistantOpen ? 'close' : 'smart_toy'} />
          <span>{t('assistant.open')}</span>
        </button>
      )}
    </div>
  );
  return railSlot ? createPortal(controls, railSlot) : controls;
};
export default ChatLauncher;
