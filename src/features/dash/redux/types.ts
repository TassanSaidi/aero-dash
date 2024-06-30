import { Survey } from "../../types/TreeSurvey";
import { Orchard } from "../../types/Orchard";


export interface FarmOrchardsMap {
    [farmId: string]: Orchard[];
}
export interface OrchardSurveyMap {
    [orchardId: string]: {
        surveys: Survey[];
        latestSurveyDate: string;
    };
}