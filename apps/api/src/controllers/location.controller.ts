import { db } from "../db";
import { createControllerAction } from "./base.controller";
import { ResponseHandler } from "../helpers/response.helpers";
import { LocationService } from "../services/location.service";
import {
  LocationListRequestDto,
  LocationCreateDto,
  LocationUpdateDto,
} from "../dtos/location.dto";

const locationService = new LocationService(db);

const list = createControllerAction(async (c) => {
  const query = await c.validateRequest("rawQuery", (v) => v);
  const locationListRequestDto = LocationListRequestDto.create(query);

  const locationListDto = await locationService.getAllLocations(
    locationListRequestDto
  );

  const locationList = locationListDto.toJSON();

  return c.responseJSON(
    ResponseHandler.success(locationList.data, locationList.meta)
  );
});

const show = createControllerAction("/:id", async (c) => {
  const id = c.req.param("id");

  const locationDto = await locationService.getLocation(id);
  const location = locationDto.toJSON();

  return c.responseJSON(ResponseHandler.success(location));
});

const create = createControllerAction(async (c) => {
  const body = await c.req.json();
  const locationCreateDto = LocationCreateDto.create(body);

  const locationDto = await locationService.createLocation(locationCreateDto);
  const location = locationDto.toJSON();

  return c.responseJSON(ResponseHandler.success(location));
});

const update = createControllerAction("/:id", async (c) => {
  const id = c.req.param("id");
  const body = await c.req.json();
  const locationUpdateDto = LocationUpdateDto.create(body);

  const locationDto = await locationService.updateLocation(
    id,
    locationUpdateDto
  );
  const location = locationDto.toJSON();

  return c.responseJSON(ResponseHandler.success(location));
});

const destroy = createControllerAction("/:id", async (c) => {
  const id = c.req.param("id");

  await locationService.deleteLocation(id);

  return c.responseStatus(204);
});

const LocationController = { list, show, create, update, destroy };

export default LocationController;
