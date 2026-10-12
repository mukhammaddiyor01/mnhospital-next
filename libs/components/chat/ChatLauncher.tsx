import { useEffect, useState } from 'react';
import { useReactiveVar } from '@apollo/client';
import { userVar } from '@/apollo/store';
import Icon from '@/libs/components/common/Icon';
import BackToTop from '@/libs/components/common/BackToTop';
import { useTranslation } from '@/libs/i18n/useTranslation';

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
  const user = useReactiveVar(userVar);
  const nickname = user._id ? user.memberNick.trim() : '';
  const [inviteVisible, setInviteVisible] = useState(false);

  const assistantEnabled = Boolean(onAssistantToggle);

  useEffect(() => {
    setInviteVisible(false);
    if (!assistantEnabled || chatOpen || assistantOpen) return;
    let hideTimer: ReturnType<typeof setTimeout>;
    const show = () => {
      if (document.hidden) return;
      setInviteVisible(true);
      hideTimer = setTimeout(() => setInviteVisible(false), 6000);
    };
    const firstTimer = setTimeout(show, 8000);
    const repeatTimer = setInterval(show, 45000);
    return () => {
      clearTimeout(firstTimer);
      clearTimeout(hideTimer);
      clearInterval(repeatTimer);
    };
  }, [chatOpen, assistantOpen, assistantEnabled, user._id]);

  const greeting = nickname
    ? t('assistant.helpNamed').replace('{name}', nickname)
    : t('assistant.helpGuest');
  return (
    <div className="clinical-chat-launchers">
      <BackToTop />
      <button
        type="button"
        className={chatOpen ? 'active' : ''}
        aria-label={t(chatOpen ? 'chat.close' : 'chat.open')}
        title={t(chatOpen ? 'chat.close' : 'chat.open')}
        aria-expanded={chatOpen}
        aria-controls="general-chat"
        onClick={onChatToggle}
      >
        <Icon name={chatOpen ? 'close' : 'chat_bubble'} />
        <span>{t('chat.open')}</span>
      </button>
      {onAssistantToggle && (
        <div className="clinical-assistant-anchor">
          <button
            type="button"
            className={`clinical-assistant-invite${inviteVisible ? ' is-visible' : ''}`}
            aria-hidden={!inviteVisible}
            tabIndex={inviteVisible ? 0 : -1}
            onClick={onAssistantToggle}
          >
            <strong>{greeting}</strong>
            <small>{t('assistant.helpAction')}</small>
          </button>
          <button
            type="button"
            className={assistantOpen ? 'active clinical-assistant-launcher' : 'clinical-assistant-launcher'}
            aria-label={t(assistantOpen ? 'chat.close' : 'assistant.open')}
            title={t(assistantOpen ? 'chat.close' : 'assistant.open')}
            aria-expanded={assistantOpen}
            aria-controls="hospital-assistant"
            onClick={onAssistantToggle}
          >
            <Icon name={assistantOpen ? 'close' : 'smart_toy'} />
            <span>{t('assistant.open')}</span>
          </button>
        </div>
      )}
    </div>
  );
};
export default ChatLauncher;
