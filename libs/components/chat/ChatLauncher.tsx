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
      )}
    </div>
  );
};
export default ChatLauncher;
