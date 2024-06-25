import {Farm} from '../../features/types/Farm'
import {Orchard} from '../../features/types/Orchard'
import {OrchardSurvey} from '../../features/types/OrchardSurvey'

import {Survey} from '../../features/types/TreeSurvey'

export interface Pagination {
    count: number;
    next: string | null;
    previous: string | null;
}

export interface FarmListResponse {
    pagination: Pagination;
    results: Farm[];
}

export interface OrchardListResponse {
    pagination: Pagination;
    results: Orchard[];
}

export interface OrchardSurveyListResponse {
    pagination: Pagination;
    results: OrchardSurvey[];
}

export interface SurveyListResponse {
    pagination: Pagination;
    results: Survey[];
}
