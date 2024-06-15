// import { createSlice } from "@reduxjs/toolkit";
// import {farmApi, useGetFarmsQuery, useGetOrchardsQuery, useGetOrchardSurveysQuery, useGetTreeSurveysQuery} from "../services/FarmApi";
// import { error } from "console";


// const treeSlice = createSlice({
//     name: 'trees',
//     initialState: {
//         farms:[],
//         orchards:[],
//         surveys:[],
//         treeSurveys:[],
//         loading: false,
//         error: null,
//     },
//     reducers: {
//         setTreeData: (state, action) => {
//             state.treeData = action.payload;
//             state.loading = false;
//             state.error = null;
//         },
//         setLoading: (state) => {
//             state.loading = true;
//             state.error = null;
//         },
//         setError(state, action) {
//             state.error = action.payload;
//             state.loading = false;
//         }
//     },
// });

// export const fetchTreeData = () => async (dispatch) => {    
//     dispatch(treeSlice.actions.setLoading());
//     try {
//         const {data:farms} = await dispatch(farmApi.endpoints.getFarms.initiate());
        
//         const farmData = await Promise.all(farms.results.map(async (farm) => {
//             const {data: orchards} = await dispatch(farmApi.endpoints.getOrchards.initiate(farm.id)).unwrap();
    
//             const orchardData = await Promise.all(orchards.results.map(async (orchard) => {
                
//                 const {data: orchardSurveys} = await dispatch(farmApi.endpoints.getOrchardSurveys.initiate(orchard.id));
                
//                 const treeData = await Promise.all(orchardSurveys.results.map(async (survey) => {
//                     const {data: treeSurveys} = await dispatch(farmApi.endpoints.getTreeSurveys.initiate(survey.id)).unwrap();
//                     return {
//                         ...orchard,
//                         surveys: orchardSurveys,
//                         treeSurveys: treeSurveys,
//                     }
//                 }));
       
//             }));
//             return {
//                 farmId: farm.id,
//                 orchards: orchardData,
                
//             }
//         }))
//         dispatch(treeSlice.actions.setTreeData(farmData));
//     }catch (error) {
//         dispatch(treeSlice.actions.setError(error.message));
//     }
// };