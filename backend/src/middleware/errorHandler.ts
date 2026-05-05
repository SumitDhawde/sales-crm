import { Request, Response, NextFunction } from 'express';

// ─── Custom AppError ──────────────────────────────────────────────────────────

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    // Captures proper stack trace in V8
    Error.captureStackTrace(this, this.constructor);
  }
}

// ─── 404 handler ─────────────────────────────────────────────────────────────

export const notFound = (req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
};

// ─── Global error handler ─────────────────────────────────────────────────────

export const errorHandler = (
  err: AppError | Error,
  _req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  const isDev = process.env.NODE_ENV === 'development';

  // Operational error we threw intentionally
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(isDev && { stack: err.stack }),
    });
    return;
  }

  // JWT or validation errors from libraries
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({ success: false, message: 'Invalid token' });
    return;
  }
  if (err.name === 'TokenExpiredError') {
    res.status(401).json({ success: false, message: 'Token expired' });
    return;
  }
  if (err.name === 'ValidationError') {
    res.status(400).json({ success: false, message: err.message });
    return;
  }

  // Unhandled / programming error — don't leak details in production
  console.error('[Unhandled Error]', err);
  res.status(500).json({
    success: false,
    message: isDev ? err.message : 'Internal Server Error',
    ...(isDev && { stack: err.stack }),
  });
};
