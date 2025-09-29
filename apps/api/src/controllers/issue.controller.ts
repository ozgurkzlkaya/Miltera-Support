import { db } from "../db";
import { createControllerAction } from "./base.controller";
import { ResponseHandler } from "../helpers/response.helpers";
import { IssueService } from "../services/issue.service";
import type { HonoEnv } from "../config/env";

const issueService = new IssueService();

const list = createControllerAction<HonoEnv>(async (c) => {
  try {
    const query = await c.validateRequest("rawQuery", (v) => v);
    
    // Get issues from service
    const issues = await issueService.getIssues({});
    
    return c.responseJSON(ResponseHandler.success(issues));
  } catch (error) {
    console.error('Error getting issues:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_SERVER_ERROR', 'Internal server error', 500));
  }
});

const show = createControllerAction<HonoEnv>("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    const issue = await issueService.getIssue(id);
    
    return c.responseJSON(ResponseHandler.success(issue));
  } catch (error) {
    console.error('Error getting issue:', error);
    return c.responseJSON(ResponseHandler.error('NOT_FOUND', 'Issue not found', 404));
  }
});

const create = createControllerAction<HonoEnv>(async (c) => {
  try {
    console.log('Issue creation endpoint called');
    const body = await c.req.json();
    
    // Frontend'den gelen parametreleri IssueService'in beklediği formata dönüştür
    const createIssueRequest = {
      productId: body.productId || null, // productId nullable
      customerId: body.companyId || body.customerId || null, // companyId veya customerId'yi kullan
      reportedBy: body.reportedBy || 'ce2a6761-82e3-48ba-af33-2f49b4b73e35', // Admin user ID
      title: body.title || 'Arıza Kaydı', // Zorunlu alan
      description: body.customerDescription || body.description || '',
      priority: body.priority || 'LOW',
      source: body.source || 'CUSTOMER',
      estimatedCost: body.estimatedCost || null,
      actualCost: body.actualCost || null
    };
    
    console.log('Creating issue with request:', createIssueRequest);
    const issue = await issueService.createIssue(createIssueRequest);
    console.log('Created issue:', issue);
    
    return c.responseJSON(ResponseHandler.success(issue));
  } catch (error: any) {
    console.error('Error creating issue:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    return c.responseJSON(ResponseHandler.error('INTERNAL_SERVER_ERROR', `Internal server error: ${error.message}`, 500));
  }
});

const update = createControllerAction<HonoEnv>("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    console.log('Issue update endpoint called for ID:', id);
    console.log('Update request body:', body);
    
    // Validation: Check if required fields are present
    if (!body.status && !body.priority && !body.description && !body.customerDescription) {
      console.error('No valid update fields provided');
      return c.responseJSON(ResponseHandler.error('BAD_REQUEST', 'At least one field must be provided for update', 400));
    }
    
    // Frontend'den gelen parametreleri IssueService'in beklediği formata dönüştür
    const updateRequest = {
      issueId: id,
      status: body.status,
      priority: body.priority,
      description: body.description,
      customerDescription: body.customerDescription,
      technicianDescription: body.technicianDescription,
      assignedTo: body.assignedTo,
      resolvedAt: body.resolvedAt ? new Date(body.resolvedAt) : undefined,
      estimatedCost: body.estimatedCost !== undefined && body.estimatedCost !== null ? parseFloat(body.estimatedCost) : undefined,
      actualCost: body.actualCost !== undefined && body.actualCost !== null ? parseFloat(body.actualCost) : undefined,
      source: body.source,
      companyId: body.companyId
    };
    
    console.log('Update request:', updateRequest);
    const issue = await issueService.updateIssue(updateRequest);
    console.log('Updated issue:', issue);
    
    return c.responseJSON(ResponseHandler.success(issue));
  } catch (error: any) {
    console.error('Error updating issue:', error);
    console.error('Error details:', error.message);
    return c.responseJSON(ResponseHandler.error('INTERNAL_SERVER_ERROR', `Internal server error: ${error.message}`, 500));
  }
});

const destroy = createControllerAction<HonoEnv>("/:id", async (c) => {
  try {
    const id = c.req.param("id");
    
    await issueService.deleteIssue(id);
    
    return c.responseJSON(ResponseHandler.success(null));
  } catch (error: any) {
    console.error('Error deleting issue:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_SERVER_ERROR', 'Internal server error', 500));
  }
});

const addProduct = createControllerAction<HonoEnv>("/:id/products", async (c) => {
  try {
    const id = c.req.param("id");
    const body = await c.req.json();
    
    const issue = await issueService.addProductToIssue(id, body.productId);
    
    return c.responseJSON(ResponseHandler.success(issue));
  } catch (error: any) {
    console.error('Error adding product to issue:', error);
    return c.responseJSON(ResponseHandler.error('INTERNAL_SERVER_ERROR', 'Internal server error', 500));
  }
});

const IssueController = { list, show, create, update, destroy, addProduct };

export default IssueController;