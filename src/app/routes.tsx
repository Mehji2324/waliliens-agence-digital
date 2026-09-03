import { Suspense, lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';
import { SiteLayout } from '../components/layout/SiteLayout';
import { LoadingState } from '../components/ui/LoadingState';

const HomePage = lazy(() => import('../pages/Home/HomePage').then(m => ({ default: m.HomePage })));
const ServicesPage = lazy(() => import('../pages/Services/ServicesPage').then(m => ({ default: m.ServicesPage })));
const WorkPage = lazy(() => import('../pages/Work/WorkPage').then(m => ({ default: m.WorkPage })));
const AboutPage = lazy(() => import('../pages/About/AboutPage').then(m => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('../pages/Contact/ContactPage').then(m => ({ default: m.ContactPage })));
const BookingPage = lazy(() => import('../pages/Booking/BookingPage').then(m => ({ default: m.BookingPage })));
const NotFoundPage = lazy(() => import('../pages/NotFound/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

export const router = createBrowserRouter([
  {
    path: '/',
    element: <SiteLayout />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<LoadingState message="Initializing Experience..." className="min-h-[70vh]" />}>
            <HomePage />
          </Suspense>
        ),
      },
      {
        path: 'services',
        element: (
          <Suspense fallback={<LoadingState message="Loading Capabilities..." className="min-h-[70vh]" />}>
            <ServicesPage />
          </Suspense>
        ),
      },
      {
        path: 'work',
        element: (
          <Suspense fallback={<LoadingState message="Loading Showcase..." className="min-h-[70vh]" />}>
            <WorkPage />
          </Suspense>
        ),
      },
      {
        path: 'about',
        element: (
          <Suspense fallback={<LoadingState message="Loading Studio Manifesto..." className="min-h-[70vh]" />}>
            <AboutPage />
          </Suspense>
        ),
      },
      {
        path: 'contact',
        element: (
          <Suspense fallback={<LoadingState message="Opening Brief Terminal..." className="min-h-[70vh]" />}>
            <ContactPage />
          </Suspense>
        ),
      },
      {
        path: 'book',
        element: (
          <Suspense fallback={<LoadingState message="Loading Discovery Calendar..." className="min-h-[70vh]" />}>
            <BookingPage />
          </Suspense>
        ),
      },
      {
        path: '*',
        element: (
          <Suspense fallback={<LoadingState message="Loading Page..." className="min-h-[70vh]" />}>
            <NotFoundPage />
          </Suspense>
        ),
      },
    ],
  },
]);
