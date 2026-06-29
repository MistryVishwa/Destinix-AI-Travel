import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'destinix_fallback_secret_key_change_in_prod';

export interface AuthRequest extends Request {
  user?: { id: string; email: string };
}

// Authentication middleware
export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string };
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token.' });
  }
};

// GET /api/user/profile
router.get('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        savedPackages: true,
        priceAlerts: true
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, ...userWithoutPassword } = user;
    
    // Map to frontend expected shape
    res.json({
      ...userWithoutPassword,
      savedPackages: user.savedPackages.map(p => p.id),
      priceAlerts: user.priceAlerts.map(a => ({
        id: a.id,
        type: 'package',
        targetIdOrName: a.packageId,
        targetPrice: a.targetPrice,
        createdAt: a.createdAt
      }))
    });
  } catch (error) {
    console.error('Fetch profile error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// PUT /api/user/profile
router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  const updates = req.body;
  
  // Prevent updating restricted fields
  delete updates.id;
  delete updates.email;
  delete updates.password;

  try {
    if (updates.savedPackages) {
      await prisma.user.update({
        where: { id: req.user!.id },
        data: {
          savedPackages: {
            set: updates.savedPackages.map((id: string) => ({ id }))
          }
        }
      });
      delete updates.savedPackages;
    }

    if (updates.priceAlerts) {
      await prisma.priceAlert.deleteMany({ where: { userId: req.user!.id }});
      if (updates.priceAlerts.length > 0) {
        await prisma.priceAlert.createMany({
          data: updates.priceAlerts.map((a: any) => ({
             userId: req.user!.id,
             packageId: a.targetIdOrName || a.packageId,
             targetPrice: a.targetPrice,
             createdAt: new Date(a.createdAt)
          }))
        });
      }
      delete updates.priceAlerts;
    }

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: updates,
      include: {
        savedPackages: true,
        priceAlerts: true
      }
    });

    const { password, ...userWithoutPassword } = updatedUser;
    res.json({
      ...userWithoutPassword,
      savedPackages: updatedUser.savedPackages.map(p => p.id),
      priceAlerts: updatedUser.priceAlerts.map(a => ({
        id: a.id,
        type: 'package',
        targetIdOrName: a.packageId,
        targetPrice: a.targetPrice,
        createdAt: a.createdAt
      }))
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// POST /api/user/saved-packages
router.post('/saved-packages', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { packageId, action } = req.body; // action: 'add' | 'remove'
  
  if (!packageId || !action) {
    return res.status(400).json({ error: 'PackageId and action are required' });
  }

  try {
    const updateQuery = action === 'add' 
      ? { connect: { id: packageId } } 
      : { disconnect: { id: packageId } };

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        savedPackages: updateQuery
      },
      include: {
        savedPackages: true,
        priceAlerts: true
      }
    });

    const { password, ...userWithoutPassword } = updatedUser;
    res.json({
      success: true,
      user: {
        ...userWithoutPassword,
        savedPackages: updatedUser.savedPackages.map(p => p.id)
      }
    });
  } catch (error) {
    console.error('Update saved packages error:', error);
    res.status(500).json({ error: 'Failed to update saved packages' });
  }
});

// POST /api/user/price-alerts
router.post('/price-alerts', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { packageId, targetPrice, action } = req.body; // action: 'add' | 'remove'
  
  try {
    if (action === 'remove') {
      await prisma.priceAlert.deleteMany({
        where: {
          userId: req.user!.id,
          packageId: packageId
        }
      });
    } else if (action === 'add') {
      if (!targetPrice) return res.status(400).json({ error: 'Target price required' });
      
      await prisma.priceAlert.upsert({
        where: {
          userId_packageId: {
            userId: req.user!.id,
            packageId: packageId
          }
        },
        update: { targetPrice },
        create: {
          userId: req.user!.id,
          packageId,
          targetPrice
        }
      });
    } else {
      return res.status(400).json({ error: 'Invalid action' });
    }

    const updatedUser = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: { savedPackages: true, priceAlerts: true }
    });

    if (!updatedUser) throw new Error("User not found");

    const { password, ...userWithoutPassword } = updatedUser;
    res.json({
      success: true,
      user: {
        ...userWithoutPassword,
        savedPackages: updatedUser.savedPackages.map(p => p.id)
      }
    });

  } catch (error) {
    console.error('Update price alerts error:', error);
    res.status(500).json({ error: 'Failed to update price alerts' });
  }
});

export default router;
