import type { Database } from "../db";
import { LocationRepository } from "../repositories/location.repository";
import {
  LocationListRequestDto,
  LocationListDto,
  LocationDto,
  LocationCreateDto,
  LocationUpdateDto,
} from "../dtos/location.dto";

class LocationService {
  private repository: LocationRepository;

  constructor(private db: Database) {
    this.repository = new LocationRepository(db);
  }

  async getAllLocations(
    locationListRequestDto: LocationListRequestDto
  ): Promise<LocationListDto> {
    const options = locationListRequestDto.value;
    const { data, pagination } = await this.repository.findAll(options);

    return LocationListDto.create({
      data,
      meta: {
        filters: options?.filters,
        sort: options?.sort,
        pagination,
      } as any
    });
  }

  /**
   * Get location
   */
  async getLocation(id: string) {
    const location = await this.repository.findById(id);

    if (!location) {
      throw new Error("Location not found");
    }

    return LocationDto.create(location);
  }

  /**
   * Create a new location
   */
  async createLocation(locationCreateDto: LocationCreateDto) {
    const location = await this.repository.create(locationCreateDto.value);

    return LocationDto.create(location);
  }

  /**
   * Update an existing location
   */
  async updateLocation(id: string, locationUpdateDto: LocationUpdateDto) {
    const location = await this.repository.update(id, locationUpdateDto.value);

    if (!location) {
      throw new Error("Location not found");
    }

    return LocationDto.create(location);
  }

  /**
   * Soft delete a location
   */
  async deleteLocation(id: string): Promise<void> {
    const isFound = await this.repository.delete(id);

    if (!isFound) {
      throw new Error("Location not found");
    }
  }
}

export { LocationService };
