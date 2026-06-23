import { useEffect, type ReactNode } from 'react';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { AppLayout } from '@/components/layout/AppLayout';
import { FullPageSpinner } from '@/components/ui/Spinner';

import { Landing } from '@/pages/Landing';
import { Login } from '@/pages/Auth/Login';
import { Register } from '@/pages/Auth/Register';
import { Dashboard } from '@/pages/Dashboard';
import { LanguageSelect } from '@/pages/LanguageSelect';
import { CoursePathPage } from '@/pages/CoursePath';
import { LessonFlow } from '@/pages/Lesson/LessonFlow';
import { Practice } from '@/pages/Practice';
import { ReviewSession } from '@/pages/ReviewSession';
import { MatchMadness } from '@/pages/games/MatchMadness';
import { Podcast } from '@/pages/Podcast';
import { Call } from '@/pages/Call';
import { Stories } from '@/pages/Stories';
import { Shop } from '@/pages/Shop';
import { Leaderboard } from '@/pages/Leaderboard';
import { Profile } from '@/pages/Profile';
import { DailyChallengePage } from '@/pages/DailyChallenge';
import { Settings } from '@/pages/Settings';

function Protected({ children }: { children: ReactNode }) {
  const status = useAuthStore((s) => s.status);
  const location = useLocation();
  if (status === 'idle' || status === 'loading') return <FullPageSpinner />;
  if (status === 'unauthenticated') return <Navigate to="/login" state={{ from: location }} replace />;
  return <>{children}</>;
}

function Shell({ children }: { children: ReactNode }) {
  return (
    <Protected>
      <AppLayout>{children}</AppLayout>
    </Protected>
  );
}

export default function App() {
  const loadSession = useAuthStore((s) => s.loadSession);
  const status = useAuthStore((s) => s.status);

  useEffect(() => {
    void loadSession();
  }, [loadSession]);

  return (
    <Routes>
      <Route path="/" element={status === 'authenticated' ? <Navigate to="/app" replace /> : <Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route path="/app" element={<Shell><Dashboard /></Shell>} />
      <Route path="/app/languages" element={<Shell><LanguageSelect /></Shell>} />
      <Route path="/app/course/:langId" element={<Shell><CoursePathPage /></Shell>} />
      <Route path="/app/practice" element={<Shell><Practice /></Shell>} />
      <Route path="/app/practice/review" element={<Shell><ReviewSession /></Shell>} />
      <Route path="/app/games/match/:langId" element={<Shell><MatchMadness /></Shell>} />
      <Route path="/app/podcast/:langId" element={<Shell><Podcast /></Shell>} />
      <Route path="/app/call/:langId" element={<Shell><Call /></Shell>} />
      <Route path="/app/stories/:langId" element={<Shell><Stories /></Shell>} />
      <Route path="/app/shop" element={<Shell><Shop /></Shell>} />
      <Route path="/app/leaderboard" element={<Shell><Leaderboard /></Shell>} />
      <Route path="/app/profile" element={<Shell><Profile /></Shell>} />
      <Route path="/app/daily" element={<Shell><DailyChallengePage /></Shell>} />
      <Route path="/app/settings" element={<Shell><Settings /></Shell>} />

      <Route path="/lesson/:id" element={<Protected><LessonFlow /></Protected>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
