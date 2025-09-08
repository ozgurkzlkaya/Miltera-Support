import { createControllerAction } from "./base.controller";
import { ServiceOperationsService } from "../services/service-operations.service";
import { createSuccessResponse, createErrorResponse } from "../helpers/response.helpers";
import type { HonoEnv } from "../config/env";
import type { 
  ServiceOperationCreate, 
  ServiceOperationUpdate, 
  ServiceWorkflow, 
  RepairSummary 
} from "../dtos/service-operations.dto";

const serviceOperationsService = new ServiceOperationsService();

const ServiceOperationsController = {
  // Basic CRUD Operations
  list: createControllerAction(async (c) => {
    try {
      const query = c.req.query();
      const page = parseInt(query.page || '1');
      const limit = parseInt(query.limit || '20');
      
      const result = await serviceOperationsService.getServiceOperations({}, page, limit);
      return c.responseJSON(createSuccessResponse(result));
    } catch (error) {
      console.error('Error listing service operations:', error);
      return c.responseJSON(createErrorResponse(500, 'Internal server error'));
    }
  }),

  show: createControllerAction(async (c) => {
    try {
      const { id } = c.req.param();
      const operation = await serviceOperationsService.getServiceOperationById(id);
      
      if (!operation) {
        return c.responseJSON(createErrorResponse(404, 'Service operation not found'));
      }
      
      return c.responseJSON(createSuccessResponse(operation));
    } catch (error) {
      console.error('Error showing service operation:', error);
      return c.responseJSON(createErrorResponse(500, 'Internal server error'));
    }
  }),

  create: createControllerAction(async (c) => {
    try {
      const body = await c.req.json() as ServiceOperationCreate;
      const operation = await serviceOperationsService.createServiceOperation(body);
      return c.responseJSON(createSuccessResponse(operation));
    } catch (error) {
      console.error('Error creating service operation:', error);
      return c.responseJSON(createErrorResponse(500, 'Internal server error'));
    }
  }),

  update: createControllerAction(async (c) => {
    try {
      const { id } = c.req.param();
      const body = await c.req.json() as ServiceOperationUpdate;
      const operation = await serviceOperationsService.updateServiceOperation({
        operationId: id,
        ...body
      });
      
      if (!operation) {
        return c.responseJSON(createErrorResponse(404, 'Service operation not found'));
      }
      
      return c.responseJSON(createSuccessResponse(operation));
    } catch (error) {
      console.error('Error updating service operation:', error);
      return c.responseJSON(createErrorResponse(500, 'Internal server error'));
    }
  }),

  // Workflow Operations
  createWorkflow: createControllerAction(async (c) => {
    try {
      const body = await c.req.json() as ServiceWorkflow;
      const result = await serviceOperationsService.createServiceWorkflow(body);
      return c.responseJSON(createSuccessResponse(result));
    } catch (error) {
      console.error('Error creating service workflow:', error);
      return c.responseJSON(createErrorResponse(500, 'Internal server error'));
    }
  }),

  createRepairSummary: createControllerAction(async (c) => {
    try {
      const body = await c.req.json() as RepairSummary;
      const result = await serviceOperationsService.createRepairSummary(body);
      return c.responseJSON(createSuccessResponse(result));
    } catch (error) {
      console.error('Error creating repair summary:', error);
      return c.responseJSON(createErrorResponse(500, 'Internal server error'));
    }
  }),

  // Statistics and Reports
  getStats: createControllerAction(async (c) => {
    try {
      const stats = await serviceOperationsService.getServiceOperationStats();
      return c.responseJSON(createSuccessResponse(stats));
    } catch (error) {
      console.error('Error getting service operation stats:', error);
      return c.responseJSON(createErrorResponse(500, 'Internal server error'));
    }
  }),

  getTechnicianPerformance: createControllerAction(async (c) => {
    try {
      const query = c.req.query();
      const dateFrom = query.dateFrom ? new Date(query.dateFrom) : undefined;
      const dateTo = query.dateTo ? new Date(query.dateTo) : undefined;
      
      const report = await serviceOperationsService.getTechnicianPerformanceReport(dateFrom, dateTo);
      return c.responseJSON(createSuccessResponse(report));
    } catch (error) {
      console.error('Error getting technician performance:', error);
      return c.responseJSON(createErrorResponse(500, 'Internal server error'));
    }
  }),

  getNonWarrantyOperations: createControllerAction(async (c) => {
    try {
      const operations = await serviceOperationsService.getNonWarrantyOperations();
      return c.responseJSON(createSuccessResponse(operations));
    } catch (error) {
      console.error('Error getting non-warranty operations:', error);
      return c.responseJSON(createErrorResponse(500, 'Internal server error'));
    }
  }),
};

export default ServiceOperationsController;
