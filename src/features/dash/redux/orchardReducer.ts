// src/features/orchard/redux/orchardSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { fetchFarmOrchards } from './thunk';
import { FarmOrchardsMap, OrchardSurveyMap } from './types';

// Initial state
const initialState: OrchardState = {
  farmOrchards: {},
  orchardSurvey: {},
  loading: false,
  error: null,
};

// Create the slice
const orchardsSlice = createSlice({
  name: 'orchards',
  initialState,
  reducers: {
    // Reducers for synchronous actions
    // setFarmOrchards: (state, action: PayloadAction<FarmOrchardsMap>) => {
    //   state.farmOrchards = action.payload;
    // },
    // setOrchardsSurvey: (state, action: PayloadAction<OrchardSurveyMap>) => {
    //   state.orchardSurvey = action.payload;
    // },
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
      })
      .addCase(fetchFarmOrchards.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch farm orchards';
      });
  },
});

// Export actions for use in components
export const { setFarmOrchards, setOrchardsSurvey } = orchardsSlice.actions;

// Export the reducer to be included in the store
export default orchardsSlice.reducer;
