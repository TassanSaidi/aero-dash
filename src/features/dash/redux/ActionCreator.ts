// src/features/orchard/redux/ActionCreator.ts

import { SET_FARM_ORCHARDS, SET_ORCHARDS_SURVEY } from './actionTypes';
import { Survey } from '../../types/TreeSurvey';
import { Orchard } from '../../types/Orchard';

export const setFarmOrchards = (farmId: string, orchards: Orchard[]) => ({
  type: SET_FARM_ORCHARDS,
  payload: { farmId, orchards },
});


export const setOrchardsSurvey = (orchardId: string, surveys: Survey[]) => ({
  type: SET_ORCHARDS_SURVEY,
  payload: { orchardId, surveys },
});
