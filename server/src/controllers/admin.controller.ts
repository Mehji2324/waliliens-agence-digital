import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { adminService } from '../services/admin.service';
import { env, isProd } from '../config/env';
import { ValidationError } from '../utils/http-errors';

const loginSchema = z.object({
  email: z.string().trim().email({ message: 'Valid admin email required' }),
  password: z.string().min(1, { message: 'Password is required' }),
  rememberMe: z.boolean().optional().default(true),
});

const cancelBookingSchema = z.object({
  reason: z.string().trim().max(500).optional(),
});

const rescheduleBookingSchema = z.object({
  newDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/, { message: 'newDate must be YYYY-MM-DD' }),
  newSlotId: z.string().trim().min(1, { message: 'newSlotId is required' }),
});

const updateContactSchema = z.object({
  status: z.enum(['new', 'processed', 'archived'], { message: 'Invalid status' }),
  notes: z.string().trim().max(1000).optional(),
});

export class AdminController {
  public async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const parsed = loginSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid login data', {
          body: parsed.error.issues.map((i) => i.message),
        });
      }

      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      const result = await adminService.login(parsed.data.email, parsed.data.password, clientIp);

      // Set secure HTTP-only session cookie
      res.cookie(env.admin.cookieName, result.token, {
        httpOnly: true,
        secure: isProd,
        sameSite: 'lax',
        maxAge: result.expiresInHours * 60 * 60 * 1000,
        path: '/',
      });

      res.status(200).json({
        success: true,
        data: {
          email: result.email,
          token: result.token,
          expiresInHours: result.expiresInHours,
        },
        message: 'Admin authentication successful.',
      });
    } catch (err) {
      next(err);
    }
  }

  public async logout(_req: Request, res: Response): Promise<void> {
    res.clearCookie(env.admin.cookieName, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      path: '/',
    });

    res.status(200).json({
      success: true,
      message: 'Logged out successfully.',
    });
  }

  public async getMe(req: Request, res: Response): Promise<void> {
    res.status(200).json({
      success: true,
      data: {
        email: req.admin?.email,
        role: 'admin',
      },
    });
  }

  public async getDashboard(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = await adminService.getDashboardData();
      res.status(200).json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  }

  public async getBookings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 15;
      const search = req.query.search ? String(req.query.search) : undefined;
      const status = req.query.status ? String(req.query.status) : undefined;
      const date = req.query.date ? String(req.query.date) : undefined;

      const result = await adminService.getBookings({
        page,
        limit,
        search,
        status,
        date,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  public async getBookingDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const booking = await adminService.getBookingById(id);
      res.status(200).json({
        success: true,
        data: booking,
      });
    } catch (err) {
      next(err);
    }
  }

  public async cancelBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const parsed = cancelBookingSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid cancellation request', {
          body: parsed.error.issues.map((i) => i.message),
        });
      }

      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      const adminEmail = req.admin?.email || env.admin.email;

      const updated = await adminService.cancelBooking(id, {
        reason: parsed.data.reason,
        adminEmail,
        ipAddress: clientIp,
      });

      res.status(200).json({
        success: true,
        data: updated,
        message: 'Booking cancelled successfully. Client & team notifications dispatched.',
      });
    } catch (err) {
      next(err);
    }
  }

  public async rescheduleBooking(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const parsed = rescheduleBookingSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid reschedule request', {
          body: parsed.error.issues.map((i) => i.message),
        });
      }

      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      const adminEmail = req.admin?.email || env.admin.email;

      const updated = await adminService.rescheduleBooking(id, {
        newDate: parsed.data.newDate,
        newSlotId: parsed.data.newSlotId,
        adminEmail,
        ipAddress: clientIp,
      });

      res.status(200).json({
        success: true,
        data: updated,
        message: 'Booking rescheduled successfully. Updated calendar invitation dispatched.',
      });
    } catch (err) {
      next(err);
    }
  }

  public async getContacts(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const page = req.query.page ? parseInt(String(req.query.page), 10) : 1;
      const limit = req.query.limit ? parseInt(String(req.query.limit), 10) : 15;
      const search = req.query.search ? String(req.query.search) : undefined;
      const status = req.query.status ? String(req.query.status) : undefined;

      const result = await adminService.getContacts({
        page,
        limit,
        search,
        status,
      });

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  }

  public async getContactDetails(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const contact = await adminService.getContactById(id);
      res.status(200).json({
        success: true,
        data: contact,
      });
    } catch (err) {
      next(err);
    }
  }

  public async updateContactStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const parsed = updateContactSchema.safeParse(req.body);
      if (!parsed.success) {
        throw new ValidationError('Invalid status update', {
          body: parsed.error.issues.map((i) => i.message),
        });
      }

      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      const adminEmail = req.admin?.email || env.admin.email;

      const updated = await adminService.updateContactStatus(id, parsed.data.status, {
        notes: parsed.data.notes,
        adminEmail,
        ipAddress: clientIp,
      });

      res.status(200).json({
        success: true,
        data: updated,
        message: 'Contact status updated successfully.',
      });
    } catch (err) {
      next(err);
    }
  }
}

export const adminController = new AdminController();
