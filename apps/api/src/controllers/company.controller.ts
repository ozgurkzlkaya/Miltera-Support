import { db } from "../db";
import { createControllerAction } from "./base.controller";
import { ResponseHandler } from "../helpers/response.helpers";
import { CompanyService } from "../services/company.service";
import {
  CompanyListRequestDto,
  CompanyCreateDto,
  CompanyUpdateDto,
} from "../dtos/company.dto";

const companyService = new CompanyService(db);

const list = createControllerAction(async (c) => {
  const query = await c.validateRequest("rawQuery", (v) => v);
  const companyListRequestDto = CompanyListRequestDto.create(query);

  const companyListDto = await companyService.getAllCompanies(
    companyListRequestDto
  );

  const companyList = companyListDto.toJSON();

  return c.responseJSON(
    ResponseHandler.success(companyList.data, companyList.meta)
  );
});

const show = createControllerAction("/:id", async (c) => {
  const id = c.req.param("id");

  const companyDto = await companyService.getCompany(id);

  const company = companyDto.toJSON();

  return c.responseJSON(ResponseHandler.success(company));
});

const create = createControllerAction(async (c) => {
  const body = await c.req.json();
  const companyCreateDto = CompanyCreateDto.create(body);

  const companyDto = await companyService.createCompany(companyCreateDto);
  const company = companyDto.toJSON();

  return c.responseJSON(ResponseHandler.success(company));
});

const update = createControllerAction("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const companyUpdateDto = CompanyUpdateDto.create(body);

  const companyDto = await companyService.updateCompany(id, companyUpdateDto);
  const company = companyDto.toJSON();

  return c.responseJSON(ResponseHandler.success(company));
});

const destroy = createControllerAction("/:id", async (c) => {
  const id = c.req.param("id");

  await companyService.deleteCompany(id);

  return c.responseStatus(200);
});

const CompanyController = {
  list,
  show,
  create,
  update,
  destroy,
};

export default CompanyController;
