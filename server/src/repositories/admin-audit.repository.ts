import { randomUUID } from 'crypto';
import { db } from '../db';
import { adminAuditLogsTable, type InsertAdminAuditLog, type SelectAdminAuditLog } from '../db/schema';
import { logger } from '../utils/logger';

export class AdminAuditRepository {
  public async log(params: {
    action: string;
    targetType: 'booking' | 'contact' | 'auth';
    targetId?: string;
    adminEmail: string;
    details?: Record<string, unknown>;
    ipAddress?: string;
  }): Promise<SelectAdminAuditLog | null> {
    const entry: InsertAdminAuditLog = {
      id: `audit_${randomUUID()}`,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId || null,
      adminEmail: params.adminEmail,
      details: params.details || {},
      ipAddress: params.ipAddress || null,
      createdAt: new Date(),
    };

    try {
      const rows = await db.insert(adminAuditLogsTable).values(entry).returning();
      return rows[0] || null;
    } catch {
      logger.info({ action: params.action, adminEmail: params.adminEmail, targetType: params.targetType, targetId: params.targetId }, `[AUDIT] Action "${params.action}"`);
      return null;
    }
  }
}

export const adminAuditRepository = new AdminAuditRepository();
