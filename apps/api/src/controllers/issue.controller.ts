import { db } from "../db";
import { createControllerAction } from "./base.controller";
import { ResponseHandler } from "../helpers/response.helpers";
import { IssueService } from "../services/issue.service";
import {
  IssueListRequestDto,
  IssueCreateDto,
  IssueUpdateDto,
} from "../dtos/issue.dto";

const issueService = new IssueService(db);

const list = createControllerAction(async (c) => {
  const query = await c.validateRequest("rawQuery", (v) => v);
  const issueListRequestDto = IssueListRequestDto.create(query);

  const issueListDto = await issueService.getAllIssues(issueListRequestDto);

  const issueList = issueListDto.toJSON();

  return c.responseJSON(
    ResponseHandler.success(issueList.data, issueList.meta)
  );
});

const show = createControllerAction("/:id", async (c) => {
  const id = c.req.param("id");

  const issueDto = await issueService.getIssue(id);

  const issue = issueDto.toJSON();

  return c.responseJSON(ResponseHandler.success(issue));
});

const create = createControllerAction(async (c) => {
  const body = await c.req.json();
  const issueCreateDto = IssueCreateDto.create(body);

  const issueDto = await issueService.createIssue(issueCreateDto);
  const issue = issueDto.toJSON();

  return c.responseJSON(ResponseHandler.success(issue));
});

const update = createControllerAction("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const issueUpdateDto = IssueUpdateDto.create(body);

  const issueDto = await issueService.updateIssue(id, issueUpdateDto);
  const issue = issueDto.toJSON();

  return c.responseJSON(ResponseHandler.success(issue));
});

const destroy = createControllerAction("/:id", async (c) => {
  const id = c.req.param("id");

  await issueService.deleteIssue(id);

  return c.responseStatus(200);
});

const IssueController = {
  list,
  show,
  create,
  update,
  destroy,
};

export default IssueController;
