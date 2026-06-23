import { useEffect } from 'react';
import { Mic, MicOff } from 'lucide-react';
import { cn } from '@/lib/cn';
import { compareAnswer } from '@/lib/answer';
import { renderRich } from '@/components/ui/RichText';
import { SpeakerButton } from './SpeakerButton';
import { useSpeechRecognition } from '@/hooks/useSpeech';
import type { ExerciseComponentProps } from './types';

export function Speak({ exercise, checked, onChange }: ExerciseComponentProps) {
  const lang = exercise.audio_lang ?? 'en-US';
  const { supported, listening, transcript, start, setTranscript } = useSpeechRecognition(lang);
  const correct = transcript.length > 0 && compareAnswer(transcript, exercise.correct_answer);

  useEffect(() => {
    onChange({ ready: transcript.length > 0, correct });
  }, [transcript, correct, onChange]);

  return (
    <div>
      <h2 className="mb-5 text-xl font-extrabold text-ink">{renderRich(exercise.question)}</h2>

      <div className="mb-5 flex items-center gap-3 rounded-2xl border-2 border-edge bg-surface p-4">
        <SpeakerButton text={exercise.correct_answer} lang={lang} />
        <span className="text-lg font-bold text-ink">{renderRich(exercise.correct_answer)}</span>
      </div>

      {supported ? (
        <div className="flex flex-col items-center gap-3">
          <button
            type="button"
            disabled={checked}
            onClick={start}
            className={cn(
              'flex h-20 w-20 items-center justify-center rounded-full text-white shadow-btn',
              listening ? 'animate-pulse bg-wrong' : 'bg-lang-english',
            )}
            aria-label="Falar"
          >
            <Mic size={36} />
          </button>
          <p className="text-center text-sm text-muted">
            {listening ? 'Ouvindo… fale a frase' : 'Toque no microfone e fale'}
          </p>
          {transcript && (
            <p className={cn('font-bold', correct ? 'text-correct' : 'text-wrong')}>"{transcript}"</p>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 text-muted">
          <MicOff size={40} />
          <p className="text-center text-sm">Reconhecimento de fala indisponível neste navegador.</p>
          <button
            type="button"
            onClick={() => setTranscript(exercise.correct_answer)}
            className="btn-secondary"
          >
            Marcar como falado
          </button>
        </div>
      )}
    </div>
  );
}
