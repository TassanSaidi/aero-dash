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

async function getFarmOrchards(): Promise<FarmOrchardsMap> {
    try {
        const response = await fetch(`${BASE_URL}/farms`, { headers: HEADERS });
        const data: FarmListResponse = await response.json();
        const farmIds = data.results.map(farm => farm.id);

        const BATCH_SIZE = 5;
        const farmOrchardsMap: FarmOrchardsMap = {};

        for (let i = 0; i < farmIds.length; i += BATCH_SIZE) {
            const batchFarmIds = farmIds.slice(i, i + BATCH_SIZE);
            const orchardsPromises = batchFarmIds.map(async (farmId) => {
                if (!farmOrchardsMap[farmId]) { // Check if orchards for farmId already fetched
                    const orchardsForFarm = await getOrchards(farmId);
                    farmOrchardsMap[farmId] = orchardsForFarm;
                }
                return { farmId, orchards: farmOrchardsMap[farmId] };
            });

            const orchardsResults = await Promise.all(orchardsPromises);
            orchardsResults.forEach(({ farmId, orchards }) => {
                farmOrchardsMap[farmId] = orchards; // Update map with fetched orchards
            });
        }
        return farmOrchardsMap;
    } catch (error) {
        console.error('Error fetching farm orchards:', error);
        throw error;
    }
}



async function getTreeSurveyResults(orchardIds: string[]): Promise<OrchardSurveyMap> {
    try {
        const BATCH_SIZE = 100; 
        const orchardSurveyMap: OrchardSurveyMap = {};

        for (const orchardId of orchardIds) {
            const orchardSurvey: OrchardSurvey[] = await getOrchardSurveys(orchardId);
            let offset = 0;
            let hasMoreSurveys = true;
            orchardSurveyMap[orchardId] = { surveys: [], latestSurveyDate: orchardSurvey[0].date };
            while (hasMoreSurveys) {
                const treeSurveyResults = await getTreeSurveys(orchardSurvey[0].id.toString(), BATCH_SIZE, offset);
                if (treeSurveyResults.length > 0) {
                    orchardSurveyMap[orchardId].surveys = orchardSurveyMap[orchardId].surveys.concat(treeSurveyResults);
                    offset += BATCH_SIZE;
                    hasMoreSurveys = treeSurveyResults.length === BATCH_SIZE;
                } else {
                    hasMoreSurveys = false;
                }
            }
        }
        return orchardSurveyMap;
    } catch (error) {
        console.log(error)
        throw error;
    }
}



async function getOrchards(farmId: number) {
    const response = await fetch(`${BASE_URL}/orchards/?farm_id=${farmId}`, { headers: HEADERS });
    const data: OrchardListResponse = await response.json();
    return data.results;
}

// create function to retrieve OrchardSurvey list give orchardId
async function getOrchardSurveys(orchardId: string) {
    const response = await fetch(`${BASE_URL}/surveys/?orchard_id=${orchardId}`, { headers: HEADERS });
    const data: OrchardSurveyListResponse = await response.json();
    return data.results;
}

// create async function to retrieve TreeSurvey list given tree_survey_id
async function getTreeSurveys(tree_survey_id: string, limit: number, offset: number) {
    const response = await fetch(`${BASE_URL}/surveys/${tree_survey_id}/tree_surveys/?limit=${limit}&offset=${offset}`, { headers: HEADERS });
    const data: SurveyListResponse = await response.json();
    return data.results;
}



export { getFarmOrchards, getOrchards, getOrchardSurveys, getTreeSurveys };