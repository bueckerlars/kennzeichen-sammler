import { Request, Response } from 'express';
import { AuthService } from '../services/authService';
import { AuthRequest } from '../middleware/auth';

const authService = new AuthService();

export class AuthController {
  async register(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      console.log('Register request received:', { username: username ? 'provided' : 'missing' });

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }

      const user = await authService.register(username, password);
      console.log('User registered successfully:', user.id);
      res.status(201).json({ id: user.id, username: user.username });
    } catch (error: any) {
      console.error('Registration error:', error);
      if (error.message === 'User already exists') {
        return res.status(409).json({ error: error.message });
      }
      res.status(500).json({ error: 'Registration failed', details: error.message });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
      }

      const token = await authService.login(username, password);
      res.json({ token });
    } catch (error: any) {
      if (error.message === 'Invalid credentials') {
        return res.status(401).json({ error: error.message });
      }
      res.status(500).json({ error: 'Login failed' });
    }
  }

  async me(req: AuthRequest, res: Response) {
    try {
      const user = await authService.getUserById(req.userId!);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      res.json({ id: user.id, username: user.username });
    } catch (error) {
      res.status(500).json({ error: 'Failed to get user' });
    }
  }
}

