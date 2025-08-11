import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/common/Button';
import { usePlayerControls } from '@/hooks/usePlayerControls';
import { usePlayerStateStore } from '@/store/usePlayerStateStore';
import { cn } from '@/utils/cn';

const speeds = [0.5, 0.75, 1, 1.25, 1.5, 2];

const SpeedPanel: React.FC = () => {
  const { t } = useTranslation();
  const { setPlaybackRate } = usePlayerControls();
  const playbackRate = usePlayerStateStore((state) => state.playbackRate);

  return (
      <div className="space-y-1">
        {speeds.map((speed) => {
          const isSelected = playbackRate === speed;
          return (
              <button
                  key={speed}
                  onClick={() => setPlaybackRate(speed)}
                  className={cn(
                      'flex w-full items-center justify-between rounded-lg py-3 px-3 text-left text-sm transition-all duration-200 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20 active:scale-98',
                      isSelected ? 'bg-white/15 text-white font-medium' : 'text-white/90 hover:text-white'
                  )}
              >
                        <span>
                            {speed === 1 ? t('normal') : `${speed}x`}
                        </span>
                {isSelected && (
                    <div className="h-4 w-4 rounded-full bg-emerald-400 flex items-center justify-center">
                      <div className="h-2 w-2 rounded-full bg-white" />
                    </div>
                )}
              </button>
          );
        })}
      </div>
  );
};

export default SpeedPanel;
