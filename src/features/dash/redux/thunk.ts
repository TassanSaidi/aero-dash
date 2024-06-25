// src/features/orchard/redux/orchardThunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import { getFarmOrchards, getTreeSurveyResults } from '../../../services/AeroApi';

// integrate getTreeSurveyResults into thunk

export const fetchFarmOrchards = createAsyncThunk(
  'orchards/fetchFarmOrchards',
  async (_, thunkAPI) => {
    try {
      const response = await getFarmOrchards();
      return response 
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data); 
    }
  }
);

export const fetchTreeSurveyResults = createAsyncThunk(
  'orchards/fetchTreeSurveyResults',
  async (orchardIds: string[], thunkAPI) => {
    try {
      const orchardSurveyResults = await getTreeSurveyResults(orchardIds)
      return orchardSurveyResults;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);


