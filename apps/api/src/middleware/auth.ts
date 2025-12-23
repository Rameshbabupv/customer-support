import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-prod'

export interface JWTPayload {
  userId: number
  tenantId: number
  isOwner: boolean
  role: string
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload
    }
  }
}

export function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JWTPayload
    req.user = payload
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

export function requireOwner(req: Request, res: Response, next: NextFunction) {
  if (!req.user?.isOwner) {
    return res.status(403).json({ error: 'Forbidden: Owner access required' })
  }
  next()
}

export function requireRole(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: Insufficient permissions' })
    }
    next()
  }
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}
