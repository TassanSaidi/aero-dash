// src/features/orchard/redux/orchardSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchFarmOrchards, fetchTreeSurveyResults } from './thunk';
import { FarmOrchardsMap, OrchardSurveyMap } from './types';

// Initial state
const initialState: OrchardState = {
  farmOrchards: {},
  orchardSurvey: {},
  loading: false,
  error: null,
  farmOrchardsFetched: false,
};

// Create the slice
const orchardsSlice = createSlice({
  name: 'orchards',
  initialState,
  reducers: {

  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchFarmOrchards.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchFarmOrchards.fulfilled, (state, action: PayloadAction<FarmOrchardsMap>) => {
        state.loading = false;
        state.farmOrchards = action.payload;
        state.farmOrchardsFetched = true;
      })
      .addCase(fetchFarmOrchards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch farm orchards';
      })
      .addCase(fetchTreeSurveyResults.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTreeSurveyResults.fulfilled, (state, action: PayloadAction<OrchardSurveyMap>) => {
        state.loading = false;
        state.orchardSurvey = action.payload;
      })
      .addCase(fetchTreeSurveyResults.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch tree survey results';
      });
  },
});

// Export actions for use in components
export const { setFarmOrchards, setOrchardsSurvey } = orchardsSlice.actions;

// Export the reducer to be included in the store
export default orchardsSlice.reducer;
