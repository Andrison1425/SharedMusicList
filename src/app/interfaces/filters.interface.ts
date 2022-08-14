import { StationOrderBy } from "../enums/station-order-by.enum";

export interface IFilters {
    orderBy: StationOrderBy,
    tags?: string[]
}