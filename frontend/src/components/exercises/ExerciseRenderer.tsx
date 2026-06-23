import { MultipleChoice } from './MultipleChoice';
import { Translation } from './Translation';
import { FillBlank } from './FillBlank';
import { DragDrop } from './DragDrop';
import { ListenType } from './ListenType';
import { Speak } from './Speak';
import { CodeBilingual } from './CodeBilingual';
import { MatchPairs } from './MatchPairs';
import type { ExerciseComponentProps } from './types';

export function ExerciseRenderer(props: ExerciseComponentProps) {
  switch (props.exercise.type) {
    case 'multiple_choice':
      return <MultipleChoice {...props} />;
    case 'translation_to':
    case 'translation_from':
      return <Translation {...props} />;
    case 'fill_blank':
      return <FillBlank {...props} />;
    case 'drag_drop':
      return <DragDrop {...props} />;
    case 'listen_type':
      return <ListenType {...props} />;
    case 'speak':
      return <Speak {...props} />;
    case 'code_bilingual':
      return <CodeBilingual {...props} />;
    case 'match_pairs':
      return <MatchPairs {...props} />;
    default:
      return <MultipleChoice {...props} />;
  }
}
