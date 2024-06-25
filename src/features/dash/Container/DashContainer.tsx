import React, { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../../../store/hooks";
import Dashboard from "../../dash/components/Dashboard";
import { fetchFarmOrchards, fetchTreeSurveyResults } from "../redux/thunk";
import { selectFarmOrchards, selectOrchardSurveys, selectLoading } from "../redux/Selector";
import { FarmOrchardsMap, OrchardSurveyMap } from "../redux/types";



interface DashboardProps {
    getFarmOrchards: () => void;
    getOrchardSurveys: (orchardIds: string[]) => void;
    orchardIds: string[];
    isLoading: boolean;
}

const DashContainer: React.FC = () => {
    const dispatch = useAppDispatch();
    const farmOrchards: FarmOrchardsMap = useAppSelector(selectFarmOrchards);
    const orchardSurvey: OrchardSurveyMap = useAppSelector(selectOrchardSurveys);
    console.log("dfrsfejgdyhk", (farmOrchards));
    let keys = farmOrchards ? Object.keys(farmOrchards) : [];
    let orchards = keys.map(key => farmOrchards[key]).flat();
    let orchardIds = orchards.map(orchard => orchard.id);

    const isLoading = useAppSelector(selectLoading);

    console.log("orchardSurvey", orchardSurvey);

    function getFarmOrchards() {
        dispatch(fetchFarmOrchards());
    }
    function getOrchardSurveys(orchardIds: string[]) {
        dispatch(fetchTreeSurveyResults(orchardIds));
    }

    // parse props to Dashboard component
    
    return (
        <Dashboard
            orchardIds={orchardIds}
            getFarmOrchards={getFarmOrchards}
            getOrchardSurveys={getOrchardSurveys}
            isLoading={isLoading}
        />
    );
}

export default DashContainer;