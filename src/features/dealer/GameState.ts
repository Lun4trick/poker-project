/* eslint-disable no-useless-return */
/* eslint-disable no-param-reassign */
import { createSlice } from '@reduxjs/toolkit/dist';
import { ActionType } from '../../utils/Types/ActionType';
import { PlayerType } from '../../utils/Types/PlayerType';
import { StreetType } from '../../utils/Types/StreetType';

export interface GameStateType {
  currentButton: PlayerType,
  herosChips: number,
  villainsChips: number,
  potSize: number,
  heroBetBox: number,
  villainBetBox: number,
  currentStreet: StreetType,
  activePlayer: PlayerType,
  activePlayersMove: ActionType,
}

const {
  PREFLOP,
  FLOP,
  TURN,
  RIVER,
  GETWINNER,
} = StreetType;

const {
  BET,
  CALL,
  CHECK,
  FOLD,
  NONE,
} = ActionType;

const {
  HERO,
  VILLAIN,
  DEALER,
} = PlayerType;

const initialState: GameStateType = {
  currentButton: HERO,
  herosChips: 2500,
  villainsChips: 2500,
  potSize: 0,
  heroBetBox: 0,
  villainBetBox: 0,
  currentStreet: PREFLOP,
  activePlayer: HERO,
  activePlayersMove: NONE,
};

export const GameStateSlice = createSlice({
  name: 'gameStates',
  initialState,
  reducers: {
    setPotManually: (state, action) =>{
      state.potSize = action.payload;
    },

    onHandOverGameStates: (state) => {
      state.activePlayer = PlayerType.NONE;
      state.currentStreet = PREFLOP;
      state.activePlayersMove = NONE;
    },

    changeCurrentButton: (state, action) => {
      state.currentButton = action.payload;
    },

    setActivePlayerByButton: (state, action) => {
      state.activePlayer = action.payload;
    },

    setPlayerAction: (state, action) => {
      state.activePlayersMove = action.payload;
    },

    setHeroBetBox: (state, action) => {
      state.herosChips -= action.payload - state.heroBetBox;
      state.heroBetBox = action.payload;
    },

    setVillainBetBox: (state, action) => {
      state.villainsChips -= action.payload - state.villainBetBox;
      state.villainBetBox = action.payload;
    },

    setPot: (state) => {
      state.potSize += (state.heroBetBox + state.villainBetBox);
      state.villainBetBox = 0;
      state.heroBetBox = 0;
    },

    heroWin: (state) => {
      state.herosChips += state.potSize;
      state.heroBetBox = 0;
      state.villainBetBox = 0;
    },

    villainWin: (state) => {
      state.villainsChips += state.potSize;
      state.heroBetBox = 0;
      state.villainBetBox = 0;
    },

    splitPot: (state) => {
      state.herosChips += state.potSize / 2;
      state.villainsChips += state.potSize / 2;
      state.heroBetBox = 0;
      state.villainBetBox = 0;
    },

    changeCurrentStreet: (state) => {
      switch (state.currentStreet) {
        case PREFLOP:
          state.currentStreet = FLOP;
          break;
        case FLOP:
          state.currentStreet = TURN;
          break;
        case TURN:
          state.currentStreet = RIVER;
          break;
        case RIVER:
          state.currentStreet = GETWINNER;
          break;
        default:
          state.currentStreet = PREFLOP;
      }
    },

    setActivePlayerByDealer: (state) => {
      const changeStreet = () => {
        switch (state.currentStreet) {
          case PREFLOP:
            state.currentStreet = FLOP;
            break;

          case FLOP:
            state.currentStreet = TURN;
            break;

          case TURN:
            state.currentStreet = RIVER;
            break;

          case RIVER:
            state.currentStreet = GETWINNER;
            break;
          default:
            break;
        }
      };

      const isLastPreFlopAction = (
        (state.activePlayer !== state.currentButton
        && state.activePlayersMove === CHECK)
        || (state.activePlayersMove === CALL)
        || (state.activePlayersMove === FOLD)
      );

      const isLastPostFlopAction = (
        (state.activePlayer === state.currentButton
        && state.activePlayersMove === CHECK)
        || (state.activePlayersMove === CALL)
        || (state.activePlayersMove === FOLD)
      );

      if (state.activePlayersMove === BET) {
        state.activePlayer = (state.activePlayer === HERO)
          ? state.activePlayer = VILLAIN
          : state.activePlayer = HERO;
        state.activePlayersMove = NONE;

        return;
      }

      if (state.activePlayer === DEALER) {
        state.activePlayer = (state.currentButton === HERO)
          ? state.activePlayer = VILLAIN
          : state.activePlayer = HERO;

        return;
      }

      if (state.currentStreet === PREFLOP) {
        switch (true) {
          case isLastPreFlopAction:
            state.activePlayer = DEALER;
            changeStreet();
            break;

          default:
            state.activePlayer = (state.activePlayer === HERO)
              ? state.activePlayer = VILLAIN
              : state.activePlayer = HERO;
            break;
        }

        state.activePlayersMove = NONE;

        return;
      }

      switch (true) {
        case isLastPostFlopAction:
          state.activePlayer = DEALER;
          changeStreet();
          break;
        default:
          state.activePlayer = (state.activePlayer === HERO)
            ? state.activePlayer = VILLAIN
            : state.activePlayer = HERO;
          break;
      }

      state.activePlayersMove = NONE;
    },
  },
});

export const {
  setPotManually,
  changeCurrentButton,
  onHandOverGameStates,
  heroWin,
  villainWin,
  splitPot,
  setActivePlayerByButton,
  setVillainBetBox,
  setHeroBetBox,
  setPot,
  setPlayerAction,
  changeCurrentStreet,
  setActivePlayerByDealer,
} = GameStateSlice.actions;
export default GameStateSlice.reducer;
