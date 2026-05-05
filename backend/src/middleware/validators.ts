import { body, query, param, validationResult } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

// ─── Run validations and send errors ─────────────────────────────────────────

export const validate = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.type === 'field' ? e.path : 'unknown', message: e.msg })),
    });
    return;
  }
  next();
};

// ─── Auth validators ──────────────────────────────────────────────────────────

export const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }).withMessage('Name too long'),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['admin', 'sales']).withMessage('Role must be admin or sales'),
];

export const loginValidator = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
];

// ─── Lead validators ──────────────────────────────────────────────────────────

export const createLeadValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ max: 100 }),
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  body('phone').optional().trim().isLength({ max: 30 }),
  body('company').optional().trim().isLength({ max: 150 }),
  body('status')
    .optional()
    .isIn(['new', 'contacted', 'qualified', 'proposal', 'converted', 'lost'])
    .withMessage('Invalid status'),
  body('source').optional().trim().isLength({ max: 100 }),
  body('notes').optional().trim().isLength({ max: 2000 }),
];

export const updateLeadValidator = [
  param('id').isUUID().withMessage('Invalid lead ID'),
  body('name').optional().trim().notEmpty().isLength({ max: 100 }),
  body('email').optional().trim().isEmail().normalizeEmail(),
  body('phone').optional().trim().isLength({ max: 30 }),
  body('company').optional().trim().isLength({ max: 150 }),
  body('status')
    .optional()
    .isIn(['new', 'contacted', 'qualified', 'proposal', 'converted', 'lost'])
    .withMessage('Invalid status'),
  body('source').optional().trim().isLength({ max: 100 }),
  body('notes').optional().trim().isLength({ max: 2000 }),
];

// ─── Deal validators ──────────────────────────────────────────────────────────

export const createDealValidator = [
  body('leadId').isUUID().withMessage('Valid leadId (UUID) is required'),
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('value')
    .notEmpty()
    .withMessage('Value is required')
    .isFloat({ min: 0 })
    .withMessage('Value must be a non-negative number'),
  body('stage')
    .optional()
    .isIn(['prospect', 'negotiation', 'won', 'lost'])
    .withMessage('Invalid deal stage'),
  body('expectedCloseDate').optional().isISO8601().withMessage('Invalid date format'),
  body('notes').optional().trim().isLength({ max: 2000 }),
];

export const updateDealValidator = [
  param('id').isUUID().withMessage('Invalid deal ID'),
  body('title').optional().trim().notEmpty().isLength({ max: 200 }),
  body('value').optional().isFloat({ min: 0 }).withMessage('Value must be a non-negative number'),
  body('stage')
    .optional()
    .isIn(['prospect', 'negotiation', 'won', 'lost'])
    .withMessage('Invalid deal stage'),
  body('expectedCloseDate').optional().isISO8601().withMessage('Invalid date format'),
  body('notes').optional().trim().isLength({ max: 2000 }),
];

// ─── Activity validators ──────────────────────────────────────────────────────

export const createActivityValidator = [
  body('leadId').isUUID().withMessage('Valid leadId (UUID) is required'),
  body('type')
    .isIn(['call', 'meeting', 'note', 'follow-up'])
    .withMessage('Type must be call, meeting, note, or follow-up'),
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 200 }),
  body('description').optional().trim().isLength({ max: 2000 }),
  body('date').optional().isISO8601().withMessage('Invalid date format'),
];

// ─── Query validators ─────────────────────────────────────────────────────────

export const paginationValidator = [
  query('page').optional().isInt({ min: 1 }).withMessage('page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('limit must be between 1 and 100'),
];
