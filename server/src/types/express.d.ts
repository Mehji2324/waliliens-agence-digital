// Augment Express Request to include custom properties added by middleware
declare namespace Express {
  interface Request {
    requestId: string;
  }
}
