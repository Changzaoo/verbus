import { Volume2 } from 'lucide-react';
import { useSpeech } from '@/hooks/useSpeech';
import { cn } from '@/lib/cn';

interface SpeakerButtonProps {
  text: string;
  lang?: string;
  size?: number;
  className?: string;
  label?: string;
}

export function SpeakerButton({ text, lang = 'en-US', size = 28, className, label }: SpeakerButtonProps) {
  const { supported, speak } = useSpeech();
  if (!supported) return null;
  return (
    <button
      type="button"
      onClick={() => speak(text, lang)}
      aria-label={label ?? 'Ouvir pronúncia'}
      className={cn(
        'inline-flex items-center justify-center rounded-2xl bg-lang-english p-3 text-white shadow-btn-sm active:translate-y-[2px]',
        className,
      )}
    >
      <Volume2 size={size} />
    </button>
  );
}
