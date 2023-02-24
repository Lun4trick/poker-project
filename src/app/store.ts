import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit/dist';
import cardsSlice from '../features/dealer/cardsSlice';
import gameStateSlice from '../features/dealer/GameState';

export const store = configureStore({
  reducer: {
    cards: cardsSlice,
    game: gameStateSlice,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
ReturnType,
RootState,
unknown,
Action<string>
>;
