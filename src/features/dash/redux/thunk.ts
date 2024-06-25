// src/features/orchard/redux/orchardThunks.ts

import { createAsyncThunk } from '@reduxjs/toolkit';
import { getFarmOrchards } from '../../../services/AeroApi';

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
