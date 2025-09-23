import { createControllerAction } from "./base.controller";
import { serviceOperationsService } from "../services/service-operations.service";
import { createSuccessResponse, createErrorResponse } from "../helpers/response.helpers";
import type { HonoEnv } from "../config/env";
import type { 
  ServiceOperationCreate, 
  ServiceOperationUpdate, 
  ServiceWorkflow, 
  RepairSummary 
} from "../dtos/service-operations.dto";

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
      return c.responseJSON(createErrorResponse('INTERNAL_SERVER_ERROR', 'Internal server error', 500));
    }
  }),

  show: createControllerAction(async (c) => {
    try {
      const id = c.req.param('id');
      if (!id) {
        return c.responseJSON(createErrorResponse('BAD_REQUEST', 'ID parameter is required', 400));
      }
      const operation = await serviceOperationsService.getServiceOperationById(id);
      
      if (!operation) {
        return c.responseJSON(createErrorResponse('NOT_FOUND', 'Service operation not found', 404));
      }
      
      return c.responseJSON(createSuccessResponse(operation));
    } catch (error) {
      console.error('Error showing service operation:', error);
      return c.responseJSON(createErrorResponse('INTERNAL_SERVER_ERROR', 'Internal server error', 500));
    }
  }),

  create: createControllerAction(async (c) => {
    try {
      const body = await c.req.json() as ServiceOperationCreate;
      console.log('Creating service operation with body:', body);
      
      const operation = await serviceOperationsService.createServiceOperation(body);
      return c.responseJSON(createSuccessResponse(operation));
    } catch (error) {
      console.error('Error creating service operation:', error);
      return c.responseJSON(createErrorResponse('INTERNAL_SERVER_ERROR', 'Internal server error', 500));
    }
  }),

  update: createControllerAction(async (c) => {
    try {
      const id = c.req.param('id');
      if (!id) {
        return c.responseJSON(createErrorResponse('BAD_REQUEST', 'ID parameter is required', 400));
      }
      
      const body = await c.req.json() as ServiceOperationUpdate;
      const operation = await serviceOperationsService.updateServiceOperation({
        operationId: id,
        ...body
      });
      
      return c.responseJSON(createSuccessResponse(operation));
    } catch (error) {
      console.error('Error updating service operation:', error);
      return c.responseJSON(createErrorResponse('INTERNAL_SERVER_ERROR', 'Internal server error', 500));
    }
  }),

  delete: createControllerAction(async (c) => {
    try {
      const id = c.req.param('id');
      if (!id) {
        return c.responseJSON(createErrorResponse('BAD_REQUEST', 'ID parameter is required', 400));
      }
      
      const operation = await serviceOperationsService.deleteServiceOperation(id);
      return c.responseJSON(createSuccessResponse(operation));
    } catch (error) {
      console.error('Error deleting service operation:', error);
      return c.responseJSON(createErrorResponse('INTERNAL_SERVER_ERROR', 'Internal server error', 500));
    }
  }),

  // Advanced Operations
  getTechnicianPerformance: createControllerAction(async (c) => {
    try {
      const technicianId = c.req.param('technicianId');
      const query = c.req.query();
      const dateFrom = query.dateFrom ? new Date(query.dateFrom) : undefined;
      const dateTo = query.dateTo ? new Date(query.dateTo) : undefined;
      
      const performance = await serviceOperationsService.getTechnicianPerformance(
        technicianId!, 
        dateFrom, 
        dateTo
      );
      
      return c.responseJSON(createSuccessResponse(performance));
    } catch (error) {
      console.error('Error fetching technician performance:', error);
      return c.responseJSON(createErrorResponse('INTERNAL_SERVER_ERROR', 'Internal server error', 500));
    }
  }),

  getNonWarrantyOperations: createControllerAction(async (c) => {
    try {
      const query = c.req.query();
      const dateFrom = query.dateFrom ? new Date(query.dateFrom) : undefined;
      const dateTo = query.dateTo ? new Date(query.dateTo) : undefined;
      
      const operations = await serviceOperationsService.getNonWarrantyOperations(dateFrom, dateTo);
      return c.responseJSON(createSuccessResponse(operations));
    } catch (error) {
      console.error('Error fetching non-warranty operations:', error);
      return c.responseJSON(createErrorResponse('INTERNAL_SERVER_ERROR', 'Internal server error', 500));
    }
  })
};

export default ServiceOperationsController;