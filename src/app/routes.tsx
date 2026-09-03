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

// Admin Pages (Phase 7)
const AdminLoginPage = lazy(() => import('../pages/Admin/LoginPage').then(m => ({ default: m.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import('../pages/Admin/DashboardPage').then(m => ({ default: m.AdminDashboardPage })));
const AdminBookingsPage = lazy(() => import('../pages/Admin/BookingsPage').then(m => ({ default: m.AdminBookingsPage })));
const AdminBookingDetailsPage = lazy(() => import('../pages/Admin/BookingDetailsPage').then(m => ({ default: m.AdminBookingDetailsPage })));
const AdminContactsPage = lazy(() => import('../pages/Admin/ContactsPage').then(m => ({ default: m.AdminContactsPage })));

export const router = createBrowserRouter([
  // Public Studio Website
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
    ],
  },

  // Admin Portal Routes (Phase 7)
  {
    path: '/admin/login',
    element: (
      <Suspense fallback={<LoadingState message="Loading Admin Terminal..." className="min-h-screen" />}>
        <AdminLoginPage />
      </Suspense>
    ),
  },
  {
    path: '/admin',
    element: (
      <Suspense fallback={<LoadingState message="Loading Dashboard..." className="min-h-screen" />}>
        <AdminDashboardPage />
      </Suspense>
    ),
  },
  {
    path: '/admin/bookings',
    element: (
      <Suspense fallback={<LoadingState message="Loading Bookings Terminal..." className="min-h-screen" />}>
        <AdminBookingsPage />
      </Suspense>
    ),
  },
  {
    path: '/admin/bookings/:id',
    element: (
      <Suspense fallback={<LoadingState message="Loading Booking Dossier..." className="min-h-screen" />}>
        <AdminBookingDetailsPage />
      </Suspense>
    ),
  },
  {
    path: '/admin/contacts',
    element: (
      <Suspense fallback={<LoadingState message="Loading Client Briefs..." className="min-h-screen" />}>
        <AdminContactsPage />
      </Suspense>
    ),
  },

  // 404 Route
  {
    path: '*',
    element: (
      <Suspense fallback={<LoadingState message="Loading Page..." className="min-h-[70vh]" />}>
        <NotFoundPage />
      </Suspense>
    ),
  },
]);
