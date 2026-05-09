import { createBrowserRouter } from 'react-router-dom';
import { AppLayout } from './app/AppLayout';
import { AuthGuard } from './app/AuthGuard';

import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { QuestionBankPage } from './pages/questions/QuestionBankPage';
import { PaperWizardPage } from './pages/papers/PaperWizardPage';
import { PaperEditorPage } from './pages/papers/PaperEditorPage';
import { PaperHistoryPage } from './pages/papers/PaperHistoryPage';
import { CurriculumPage } from './pages/curriculum/CurriculumPage';
import { QuestionTypeTemplatePage } from './pages/templates/QuestionTypeTemplatePage';


export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'questions',
        element: <QuestionBankPage />,
      },
      {
        path: 'papers/new',
        element: <PaperWizardPage />,
      },
      {
        path: 'papers',
        element: <PaperHistoryPage />,
      },
      {
        path: 'papers/:paperId',
        element: <PaperEditorPage />,
      },
      {
        path: 'curriculum',
        element: <CurriculumPage />,
      },
      {
        path: 'question-type-templates',
        element: <QuestionTypeTemplatePage />,
      },
    ],
  },
]);
