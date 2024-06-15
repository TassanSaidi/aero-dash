import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'
import {Farm} from '../features/types/Farm'
import { get } from 'http';

interface Pagination {
    count: number;
    next: string | null;
    previous: string | null;
}

interface FarmListResponse {
    pagination: Pagination;
    results: Farm[];
}

interface OrchardListResponse {
    pagination: Pagination;
    results: Orchard[];
}

interface OrchardSurveyListResponse {
    pagination: Pagination;
    results: OrchardSurvey[];
}

interface SurveyListResponse {
    pagination: Pagination;
    results: Survey[];
}


const APP_API_KEY = '5d03db72854d43a8ce0c63e0d4fb4a261bc29b95ea46b541f537dbf0891b45d6'

const headers: CustomHeaders = {
    Authorization: 'Bearer 5d03db72854d43a8ce0c63e0d4fb4a261bc29b95ea46b541f537dbf0891b45d6',
    'Content-Type': 'application/json',
  };


const baseQuery = fetchBaseQuery({ 
    baseUrl: 'https://api.aerobotics.com/farming' ,
    headers: headers
})
export const farmApi = createApi({
    reducerPath: 'farmApi',
    baseQuery,
    endpoints: (builder) => ({
        getFarms: builder.query<FarmListResponse, void>({
            query: () => 'farms',
            providesTags: ['Farms'], // Example of providing a single tag as a string
            refetchOnMountOrArgChange: true,
            staleTime: 300000, // 5 minutes
          }),
        getOrchards: builder.query<OrchardListResponse,String>({
            query: (farmId) => `orchards/?farm_id=${farmId}`,
        }),
        getOrchardSurveys: builder.query<OrchardSurveyListResponse,String>({
            query: (orchardId) => `surveys/?orchard_id=${orchardId}`,
        }),
        getTreeSurveys: builder.query<SurveyListResponse,String>({
            query: (tree_survey_id) => `surveys/${tree_survey_id}/tree_surveys`}),

        }),
})



export const { 
    useGetFarmsQuery, 
    useLazyGetOrchardsQuery,
    useLazyGetOrchardSurveysQuery,
    useLazyGetTreeSurveysQuery, 
} = farmApi