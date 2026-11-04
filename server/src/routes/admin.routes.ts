import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { adminController } from '../controllers/admin.controller';
import { requireAdminAuth } from '../middleware/admin-auth';
import { csrfOriginCheck } from '../middleware/csrf-origin';

export const adminRouter = Router();

// Dedicated rate limiter for admin login to prevent brute force
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 login attempts per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many admin login attempts. Please try again in 15 minutes.',
    },
  },
});

// ─── Public Authentication Endpoints ──────────────────────────────────────────
adminRouter.post('/login', adminLoginLimiter, csrfOriginCheck, (req, res, next) => adminController.login(req, res, next));
adminRouter.post('/logout', csrfOriginCheck, (req, res) => adminController.logout(req, res));

// ─── Protected Admin Endpoints ────────────────────────────────────────────────
adminRouter.use(requireAdminAuth);
// Apply CSRF check to all state-changing protected routes
adminRouter.use(csrfOriginCheck);

adminRouter.get('/me', (req, res) => adminController.getMe(req, res));
adminRouter.get('/dashboard', (req, res, next) => adminController.getDashboard(req, res, next));

// Bookings Management
adminRouter.get('/bookings', (req, res, next) => adminController.getBookings(req, res, next));
adminRouter.get('/bookings/:id', (req, res, next) => adminController.getBookingDetails(req, res, next));
adminRouter.post('/bookings/:id/cancel', (req, res, next) => adminController.cancelBooking(req, res, next));
adminRouter.post('/bookings/:id/reschedule', (req, res, next) => adminController.rescheduleBooking(req, res, next));

// Contacts Management
adminRouter.get('/contacts', (req, res, next) => adminController.getContacts(req, res, next));
adminRouter.get('/contacts/:id', (req, res, next) => adminController.getContactDetails(req, res, next));
// PATCH only — duplicate POST route removed
adminRouter.patch('/contacts/:id/status', (req, res, next) => adminController.updateContactStatus(req, res, next));
