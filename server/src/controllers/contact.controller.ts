import type { Request, Response } from 'express';
import { contactService } from '../services/contact.service';

export async function submitContact(req: Request, res: Response): Promise<void> {
  const result = await contactService.submitBrief(req.body);

  res.status(200).json({
    success: true,
    message: 'Message received successfully',
    data: {
      messageId: result.messageId,
      timestamp: result.timestamp,
      receivedAt: result.receivedAt,
    },
    ...(req.requestId ? { requestId: req.requestId } : {}),
  });
}
