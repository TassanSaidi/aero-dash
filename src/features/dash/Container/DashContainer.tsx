import React, {useEffect} from "react";
import {useAppDispatch, useAppSelector} from "../../../store/hooks";
import Dashboard from "../../dash/components/Dashboard";
import {fetchFarmOrchards} from "../redux/thunk";
import {selectFarmOrchards} from "../redux/Selector";
import { FarmOrchardsMap } from "../redux/types";


const DashContainer: React.FC<DashContainerProps> = () => {
    const dispatch = useAppDispatch();
    const farmOrchards: FarmOrchardsMap = useAppSelector(selectFarmOrchards);
    console.log("dfrsfejgdyhk", (farmOrchards));
    let keys = farmOrchards ? Object.keys(farmOrchards) : [];
    let orchards = keys.map(key => farmOrchards[key]).flat();
    let orchardIds = orchards.map(orchard => orchard.id);


    
    

    
    useEffect(() => {
        dispatch(fetchFarmOrchards());
    }, [dispatch]);

    return(
        <Dashboard name= {"farmOrchard"} />
    );
}

export default DashContainer;