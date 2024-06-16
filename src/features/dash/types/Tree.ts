export default interface TreeData {
    id: number;
    farmName: string;
    orchardName: string;
    totalTreesSurveyed: number;
    latestSurveyDate: string;
    averageNDVI: number;
    averageNDRE: number;
    ndviValues: number[];
    ndreValues: number[];
    corordinates: { lat: number; lng: number }[];
};
