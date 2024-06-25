export interface FarmOrchardsMap {
    [farmId: string]: Orchard[];
}
export interface OrchardSurveyMap {
    [orchardId: string]: {
        surveys: Survey[];
        latestSurveyDate: string;
    };
}