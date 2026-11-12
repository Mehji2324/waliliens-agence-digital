import type { Request, Response } from 'express';

type VercelRequest = Request & { url: string };

export default async function handler(req: VercelRequest, res: Response): Promise<void> {
  // The Vercel rewrite carries the original API path in the `path` query
  // parameter. Restore Express's /api/... path before dispatching the request.
  const incoming = new URL(req.url, `https://${req.headers.host ?? 'localhost'}`);
  const apiPath = incoming.searchParams.get('path') ?? '';
  incoming.searchParams.delete('path');
  req.url = `/api/${apiPath}${incoming.search}`;

  // Keep process liveness observable even while deployment configuration is
  // incomplete. Importing the app validates production secrets at startup.
  if (req.url.split('?')[0] === '/api/health') {
    res.status(200).json({
      status: 'ok',
      service: 'waliliens-api',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  try {
    const serverModule = await import('../server/dist/app.js');
    const app = serverModule.default.app;
    app(req, res);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    const missingVariables = [...message.matchAll(/^\s*✗\s+([A-Z][A-Z0-9_]*)/gm)].map((match) => match[1]);
    if (missingVariables.length > 0) {
      console.error('[api] Required deployment environment is incomplete:', missingVariables.join(', '));
      res.status(503).json({
        success: false,
        error: {
          code: 'CONFIGURATION_INCOMPLETE',
          message: 'API configuration is incomplete.',
          missingVariables,
        },
      });
      return;
    }

    console.error('[api] Failed to initialize Express application:', error);
    res.status(500).json({
      success: false,
      error: { code: 'API_INITIALIZATION_FAILED', message: 'API failed to initialize.' },
    });
  }
}
