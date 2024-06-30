import { Survey } from '../features/types/TreeSurvey';
import { Orchard } from '../features/types/Orchard';
import { OrchardSurvey } from '../features/types/OrchardSurvey'
import { FarmListResponse, OrchardListResponse, OrchardSurveyListResponse, SurveyListResponse } from './Responses/ApiResponse'

const BASE_URL = 'https://api.aerobotics.com/farming';
const HEADERS = {
    Authorization: 'Bearer 5d03db72854d43a8ce0c63e0d4fb4a261bc29b95ea46b541f537dbf0891b45d6'
}

interface FarmOrchardsMap {
    [farmId: string]: Orchard[];
}
interface OrchardSurveyMap {
    [orchardId: string]: {
        surveys: Survey[];
        latestSurveyDate: string;
    };
}


async function fetchOrchardsForFarms(farmIds: string[]): Promise<FarmOrchardsMap> {
    const BATCH_SIZE = 100;
    const farmOrchardsMap: FarmOrchardsMap = {};

    for (let i = 0; i < farmIds.length; i += BATCH_SIZE) {
        const batchFarmIds = farmIds.slice(i, i + BATCH_SIZE);
        const orchardsPromises = batchFarmIds.map(async (farmId) => {
            const orchardsForFarm = await getOrchards(farmId);
            return { farmId, orchards: orchardsForFarm };
        });

        const orchardsResults = await Promise.all(orchardsPromises);
        orchardsResults.forEach(({ farmId, orchards }) => {
            farmOrchardsMap[farmId] = orchards;
        });
    }
    return farmOrchardsMap;
}

async function getFarmOrchards(): Promise<FarmOrchardsMap> {
    try {
        const response = await fetch(`${BASE_URL}/farms`, { headers: HEADERS });
        const data: FarmListResponse = await response.json();
        const farmIds = data.results.map(farm => farm.id);
        return await fetchOrchardsForFarms(farmIds);
    } catch (error) {
        console.error('Error fetching farm orchards:', error);
        throw error;
    }
}


async function getOrchards(farmId: number) {
    const response = await fetch(`${BASE_URL}/orchards/?farm_id=${farmId}`, { headers: HEADERS });
    const data: OrchardListResponse = await response.json();
    return data.results;
}


async function getOrchardSurveys(orchardId: string) {
    const response = await fetch(`${BASE_URL}/surveys/?orchard_id=${orchardId}`, { headers: HEADERS });
    const data: OrchardSurveyListResponse = await response.json();
    return data.results;
}


async function getTreeSurveys(tree_survey_id: string, limit: number, offset: number) {
    const response = await fetch(`${BASE_URL}/surveys/${tree_survey_id}/tree_surveys/?limit=${limit}&offset=${offset}`, { headers: HEADERS });
    const data: SurveyListResponse = await response.json();
    return data.results;
}


async function getTreeSurveyResults(orchardIds: string[]): Promise<OrchardSurveyMap> {
    try {
        const MAX_ORCHARDS_PER_BATCH = 4;
        const orchardChunks = chunkArray(orchardIds, MAX_ORCHARDS_PER_BATCH);
        const orchardSurveyMap: OrchardSurveyMap = {};
        for (const chunk of orchardChunks) {
            console.log('Chunk:', chunk);
            const surveyPromises = chunk.map(orchardId => getSurveysForOrchard(orchardId));
            const surveyResults = await Promise.all(surveyPromises);
            surveyResults.forEach(([orchardId, details]) => {
                orchardSurveyMap[orchardId] = details;
            });
        }
        console.log('Orchard Survey Map:', orchardSurveyMap);
        return orchardSurveyMap;
    } catch (error) {
        console.log(error);
        throw error;
    }
}


function chunkArray(array, size) {
    const chunkedArr = [];
    for (let i = 0; i < array.length; i += size) {
        chunkedArr.push(array.slice(i, i + size));
    }
    return chunkedArr;
}

async function getSurveysForOrchard(orchardId: string): Promise<[string, OrchardSurveyDetails]> {
    const BATCH_SIZE = 3000;
    const orchardSurvey: OrchardSurvey[] = await getOrchardSurveys(orchardId);
    let offset = 0;
    let hasMoreSurveys = true;
    const surveys = [];

    if (orchardSurvey.length === 0 || !orchardSurvey[0].date) {
        return [orchardId, { surveys: [], latestSurveyDate: "" }];
    }
    let latestSurveyDate = orchardSurvey[0].date.toString();

    while (hasMoreSurveys) {
        const treeSurveyResults = await getTreeSurveys(orchardSurvey[0].id.toString(), BATCH_SIZE, offset);
        if (treeSurveyResults.length > 0) {
            surveys.push(...treeSurveyResults);
            offset += BATCH_SIZE;
            hasMoreSurveys = treeSurveyResults.length === BATCH_SIZE;
        } else {
            hasMoreSurveys = false;
        }
    }

    return [orchardId, { surveys, latestSurveyDate }];
}


export { getFarmOrchards, getTreeSurveyResults };