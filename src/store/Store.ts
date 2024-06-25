import { configureStore } from '@reduxjs/toolkit'

import orchardsReducer from '../features/dash/redux/orchardReducer'

const store = configureStore({
  reducer: {
    orchards: orchardsReducer
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware(),
})



export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export default store;