
import { RootState } from '../../../store/Store';

export const selectFarmOrchards = (state: RootState) => state.orchards.farmOrchards;
export const selectOrchardSurveys = (state: RootState) => state.orchards.orchardSurvey;
export const selectLoading = (state: RootState) => state.orchards.loading;
export const selectError = (state: RootState) => state.orchards.error;
export const selectFarmOrchardsFetched = (state: RootState) => state.orchards.farmOrchardsFetched;

