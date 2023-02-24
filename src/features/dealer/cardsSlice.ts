/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit/dist';
import { shuffleDeck } from '../../utils/functions/shuffleDeck';
import { Card } from '../../utils/Types/Card';

export interface CardsSliceType {
  shuffledDeck: Card[],
  board: Card[],
  heroHand: Card[],
  villainHand: Card[],
}
const initialState: CardsSliceType = {
  shuffledDeck: [],
  board: [],
  heroHand: [],
  villainHand: [],
};

export const CardsSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {
    reShuffleDeck: (state) => {
      state.shuffledDeck = shuffleDeck();
    },

    dealHero: (state) => {
      const currentDeck = [...state.shuffledDeck];

      state.heroHand = currentDeck.splice(0, 2);
      state.shuffledDeck = currentDeck;
    },

    dealvillain: (state) => {
      const currentDeck = [...state.shuffledDeck];

      state.villainHand = currentDeck.splice(0, 2);
      state.shuffledDeck = currentDeck;
    },

    getFlop: (state) => {
      const currentDeck = [...state.shuffledDeck];

      state.board = currentDeck.splice(0, 3);
      state.shuffledDeck = currentDeck;
    },

    getTurn: (state) => {
      const currentDeck = [...state.shuffledDeck];

      state.board = [...state.board, (currentDeck.shift() as Card)];
      state.shuffledDeck = currentDeck;
    },

    getRiver: (state) => {
      const currentDeck = [...state.shuffledDeck];

      state.board = [...state.board, (currentDeck.shift() as Card)];
      state.shuffledDeck = currentDeck;
    },

    clearBoard: (state) => {
      state.board = [];
    },
  },
});

export const {
  reShuffleDeck,
  dealHero,
  dealvillain,
  getFlop,
  getTurn,
  getRiver,
  clearBoard,
} = CardsSlice.actions;
export default CardsSlice.reducer;
