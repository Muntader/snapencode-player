import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/common/Button';
import { usePlayerControls } from '@/hooks/usePlayerControls';
import { Icons } from '../common/Icon';

const PipButton: React.FC = () => {
  const { t } = useTranslation();
  const { togglePip } = usePlayerControls();

  return (
    <Button onClick={togglePip} aria-label={t('pip')} title={t('pip')}>
      <Icons.PipIcon className="w-6 h-6 fill-current text-primary" />
    </Button>
  );
};

export default PipButton;
