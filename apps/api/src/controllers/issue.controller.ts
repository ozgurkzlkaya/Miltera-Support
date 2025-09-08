import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { IssueService } from '../services/issue.service';
import { getAuth } from '../lib/auth';

const issueService = new IssueService();

// Validation schemas
const createIssueSchema = z.object({
  source: z.enum(['CUSTOMER', 'TSP', 'FIRST_PRODUCTION']),
  companyId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  internalCategoryId: z.string().uuid().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']),
  customerDescription: z.string().optional(),
  technicianDescription: z.string().optional(),
  isUnderWarranty: z.boolean().default(false),
  estimatedCost: z.number().min(0).optional(),
  productIds: z.array(z.string().uuid()).default([]),
});

const updateIssueSchema = z.object({
  status: z.enum([
    'OPEN',
    'IN_PROGRESS',
    'WAITING_CUSTOMER_APPROVAL',
    'REPAIRED',
    'CLOSED',
    'CANCELLED'
  ]).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  customerDescription: z.string().optional(),
  technicianDescription: z.string().optional(),
  isUnderWarranty: z.boolean().optional(),
  estimatedCost: z.number().min(0).optional(),
  actualCost: z.number().min(0).optional(),
  preInspectionDate: z.string().datetime().optional(),
  repairDate: z.string().datetime().optional(),
  preInspectedBy: z.string().uuid().optional(),
  repairedBy: z.string().uuid().optional(),
});

const issueFilterSchema = z.object({
  status: z.enum([
    'OPEN',
    'IN_PROGRESS',
    'WAITING_CUSTOMER_APPROVAL',
    'REPAIRED',
    'CLOSED',
    'CANCELLED'
  ]).optional(),
  source: z.enum(['CUSTOMER', 'TSP', 'FIRST_PRODUCTION']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
  companyId: z.string().uuid().optional(),
  categoryId: z.string().uuid().optional(),
  isUnderWarranty: z.boolean().optional(),
  createdBy: z.string().uuid().optional(),
  search: z.string().optional(),
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
});

export const issueController = new Hono();

// Arıza listesi
issueController.get('/', zValidator('query', issueFilterSchema), async (c) => {
  try {
    const auth = await getAuth(c);
    if (!auth.isAuthenticated) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const query = c.req.valid('query');
    const { page, limit, ...filter } = query;

    // Müşteri kullanıcıları sadece kendi arızalarını görebilir
    if (auth.user.role === 'CUSTOMER') {
      filter.companyId = auth.user.companyId;
    }

    const result = await issueService.getIssues(filter, page, limit);

    return c.json({
      success: true,
      data: result.issues,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Error getting issues:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Arıza detayı
issueController.get('/:id', async (c) => {
  try {
    const auth = await getAuth(c);
    if (!auth.isAuthenticated) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const issueId = c.req.param('id');
    const issue = await issueService.getIssueById(issueId);

    if (!issue) {
      return c.json({ error: 'Issue not found' }, 404);
    }

    // Müşteri kullanıcıları sadece kendi arızalarını görebilir
    if (auth.user.role === 'CUSTOMER' && issue.company?.id !== auth.user.companyId) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    return c.json({
      success: true,
      data: issue,
    });
  } catch (error) {
    console.error('Error getting issue:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Yeni arıza kaydı oluşturma
issueController.post('/', zValidator('json', createIssueSchema), async (c) => {
  try {
    const auth = await getAuth(c);
    if (!auth.isAuthenticated) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const body = c.req.valid('json');
    const {
      source,
      companyId,
      categoryId,
      internalCategoryId,
      priority,
      customerDescription,
      technicianDescription,
      isUnderWarranty,
      estimatedCost,
      productIds
    } = body;

    // Müşteri kullanıcıları sadece kendi firması için arıza oluşturabilir
    if (auth.user.role === 'CUSTOMER') {
      if (companyId !== auth.user.companyId) {
        return c.json({ error: 'Forbidden' }, 403);
      }
    }

    const issue = await issueService.createIssue({
      source,
      companyId: companyId || auth.user.companyId,
      categoryId,
      internalCategoryId,
      priority,
      customerDescription,
      technicianDescription,
      isUnderWarranty,
      estimatedCost,
      createdBy: auth.user.id,
      productIds,
    });

    return c.json({
      success: true,
      data: issue,
      message: 'Arıza kaydı başarıyla oluşturuldu',
    }, 201);
  } catch (error) {
    console.error('Error creating issue:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Arıza kaydını güncelleme
issueController.patch('/:id', zValidator('json', updateIssueSchema), async (c) => {
  try {
    const auth = await getAuth(c);
    if (!auth.isAuthenticated) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const issueId = c.req.param('id');
    const body = c.req.valid('json');
    const {
      status,
      priority,
      customerDescription,
      technicianDescription,
      isUnderWarranty,
      estimatedCost,
      actualCost,
      preInspectionDate,
      repairDate,
      preInspectedBy,
      repairedBy
    } = body;

    // Mevcut arıza kaydını kontrol et
    const existingIssue = await issueService.getIssueById(issueId);
    if (!existingIssue) {
      return c.json({ error: 'Issue not found' }, 404);
    }

    // Müşteri kullanıcıları sadece kendi arızalarını güncelleyebilir
    if (auth.user.role === 'CUSTOMER' && existingIssue.company?.id !== auth.user.companyId) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    // Müşteri kullanıcıları sadece belirli alanları güncelleyebilir
    if (auth.user.role === 'CUSTOMER') {
      const allowedFields = ['customerDescription'];
      const hasUnauthorizedFields = Object.keys(body).some(key => !allowedFields.includes(key));
      if (hasUnauthorizedFields) {
        return c.json({ error: 'Forbidden' }, 403);
      }
    }

    const issue = await issueService.updateIssue({
      issueId,
      status,
      priority,
      customerDescription,
      technicianDescription,
      isUnderWarranty,
      estimatedCost,
      actualCost,
      preInspectionDate: preInspectionDate ? new Date(preInspectionDate) : undefined,
      repairDate: repairDate ? new Date(repairDate) : undefined,
      preInspectedBy,
      repairedBy,
      updatedBy: auth.user.id,
    });

    return c.json({
      success: true,
      data: issue,
      message: 'Arıza kaydı başarıyla güncellendi',
    });
  } catch (error) {
    console.error('Error updating issue:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Arıza kaydını silme (sadece ADMIN)
issueController.delete('/:id', async (c) => {
  try {
    const auth = await getAuth(c);
    if (!auth.isAuthenticated) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Sadece ADMIN arıza kaydını silebilir
    if (auth.user.role !== 'ADMIN') {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const issueId = c.req.param('id');
    const issue = await issueService.deleteIssue(issueId);

    if (!issue) {
      return c.json({ error: 'Issue not found' }, 404);
    }

    return c.json({
      success: true,
      message: 'Arıza kaydı başarıyla silindi',
    });
  } catch (error) {
    console.error('Error deleting issue:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Arıza istatistikleri
issueController.get('/stats/overview', async (c) => {
  try {
    const auth = await getAuth(c);
    if (!auth.isAuthenticated) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const stats = await issueService.getIssueStats();

    return c.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error('Error getting issue stats:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Arıza numarası ile arama (müşteri portalı için)
issueController.get('/search/:issueNumber', async (c) => {
  try {
    const auth = await getAuth(c);
    if (!auth.isAuthenticated) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    const issueNumber = c.req.param('issueNumber');
    
    // Arıza numarası ile arama
    const result = await issueService.getIssues({ search: issueNumber }, 1, 1);
    const issue = result.issues[0];

    if (!issue) {
      return c.json({ error: 'Issue not found' }, 404);
    }

    // Müşteri kullanıcıları sadece kendi arızalarını görebilir
    if (auth.user.role === 'CUSTOMER' && issue.company?.id !== auth.user.companyId) {
      return c.json({ error: 'Forbidden' }, 403);
    }

    return c.json({
      success: true,
      data: issue,
    });
  } catch (error) {
    console.error('Error searching issue:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Ön muayene yapma (TSP için)
issueController.post('/:id/pre-inspection', zValidator('json', z.object({
  technicianDescription: z.string(),
  isUnderWarranty: z.boolean(),
  estimatedCost: z.number().min(0).optional(),
})), async (c) => {
  try {
    const auth = await getAuth(c);
    if (!auth.isAuthenticated) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Sadece TSP ve ADMIN ön muayene yapabilir
    if (auth.user.role !== 'TSP' && auth.user.role !== 'ADMIN') {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const issueId = c.req.param('id');
    const body = c.req.valid('json');
    const { technicianDescription, isUnderWarranty, estimatedCost } = body;

    const issue = await issueService.updateIssue({
      issueId,
      status: 'IN_PROGRESS',
      technicianDescription,
      isUnderWarranty,
      estimatedCost,
      preInspectionDate: new Date(),
      preInspectedBy: auth.user.id,
      updatedBy: auth.user.id,
    });

    return c.json({
      success: true,
      data: issue,
      message: 'Ön muayene tamamlandı',
    });
  } catch (error) {
    console.error('Error pre-inspection:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Tamir tamamlama (TSP için)
issueController.post('/:id/complete-repair', zValidator('json', z.object({
  technicianDescription: z.string(),
  actualCost: z.number().min(0).optional(),
})), async (c) => {
  try {
    const auth = await getAuth(c);
    if (!auth.isAuthenticated) {
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Sadece TSP ve ADMIN tamir tamamlayabilir
    if (auth.user.role !== 'TSP' && auth.user.role !== 'ADMIN') {
      return c.json({ error: 'Forbidden' }, 403);
    }

    const issueId = c.req.param('id');
    const body = c.req.valid('json');
    const { technicianDescription, actualCost } = body;

    const issue = await issueService.updateIssue({
      issueId,
      status: 'REPAIRED',
      technicianDescription,
      actualCost,
      repairDate: new Date(),
      repairedBy: auth.user.id,
      updatedBy: auth.user.id,
    });

    return c.json({
      success: true,
      data: issue,
      message: 'Tamir tamamlandı',
    });
  } catch (error) {
    console.error('Error completing repair:', error);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

export default issueController;
