import { Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';

interface SocketWithAuth extends Socket {
  userId?: string;
  sessionId?: string;
}

export function authenticateSocket(socket: SocketWithAuth, next: (err?: any) => void) {
  try {
    // For development, we'll skip authentication
    // In production, you'd verify JWT tokens here
    
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    
    if (process.env.NODE_ENV === 'development') {
      // Development: Create a temporary user ID
      socket.userId = `dev-user-${socket.id}`;
      socket.sessionId = `dev-session-${Date.now()}`;
      
      logger.info(`Development auth: ${socket.userId} connected`);
      return next();
    }

    if (!token) {
      logger.warn(`Authentication failed: No token provided for ${socket.id}`);
      return next(new Error('Authentication required'));
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    socket.userId = decoded.userId;
    socket.sessionId = decoded.sessionId;

    logger.info(`User authenticated: ${socket.userId} (${socket.id})`);
    next();

  } catch (error) {
    logger.error(`Authentication error for ${socket.id}:`, error);
    next(new Error('Authentication failed'));
  }
}