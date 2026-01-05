/**
 * @file request.d.ts
 * @description Type definition expansion for the Express Request object to include custom properties.
 */

declare namespace Express {
  export interface Request {
    /** The ID of the authenticated user */
    userId?: string,
    /** The role of the authenticated user (e.g., "teacher", "student") */
    role?: string
  }
}