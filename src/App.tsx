/* eslint-disable no-plusplus */
import React, { useCallback, useEffect, useState } from 'react';
import 'bulma/css/bulma.css';
import './app.scss';
import { HeroContainer } from './components/PlayeContainer/HeroContainer';
import { VillainContainer } from './components/PlayeContainer/VillainBot';
import { TabeleBody } from './components/Table/TableBody/Table';
import { ActionButtons } from './components/ActionButtons/ActionButtons';
import {
  changeCurrentButton,
  heroWin,
  onHandOverGameStates,
  setActivePlayerByButton,
  setActivePlayerByDealer,
  setHeroBetBox, setPot,
  setPotManually,
  setVillainBetBox,
  splitPot,
  villainWin,
} from './features/dealer/GameState';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { wait } from './utils/functions/wait';
import {
  clearBoard,
  dealHero,
  dealvillain,
  getFlop,
  getRiver,
  getTurn,
  reShuffleDeck,
} from './features/dealer/cardsSlice';
import { StreetType } from './utils/Types/StreetType';
import { PlayerType } from './utils/Types/PlayerType';
import { getCombination } from './utils/functions/getCombination';
import { ActionType } from './utils/Types/ActionType';
import { WinnerType } from './utils/Types/WinnerType';

const App: React.FC = () => {
  const {
    PREFLOP,
    FLOP,
    TURN,
    RIVER,
    GETWINNER,
  } = StreetType;

  const currentStreet = useAppSelector(state => state.game.currentStreet);
  const currentButton = useAppSelector(state => state.game.currentButton);
  const board = useAppSelector(state => state.cards.board);
  const heroHand = useAppSelector(state => state.cards.heroHand);
  const villainHand = useAppSelector(state => state.cards.villainHand);
  const lastPlayer = useAppSelector(state => state.game.activePlayer);
  const lastMove = useAppSelector(state => state.game.activePlayersMove);
  const [currentWinner, setWinner] = useState<WinnerType | null>(null);
  const [dealcount, setDealCount] = useState(0);
  const dispatch = useAppDispatch();

  const setBlinds = useCallback(() => {
    if (currentButton === PlayerType.HERO) {
      dispatch(setVillainBetBox(100));
      dispatch(setHeroBetBox(50));
    } else if (currentButton === PlayerType.VILLAIN) {
      dispatch(setVillainBetBox(50));
      dispatch(setHeroBetBox(100));
    }
  }, [currentButton]);

  const changeButton = () => {
    if (currentButton === PlayerType.HERO) {
      dispatch(changeCurrentButton(PlayerType.VILLAIN));
    } else if (currentButton === PlayerType.VILLAIN) {
      dispatch(changeCurrentButton(PlayerType.HERO));
    }
  };

  const DealCards = async () => {
    dispatch(reShuffleDeck());
    await wait(100);
    dispatch(dealHero());
    await wait(100);
    dispatch(dealvillain());
  };

  useEffect(() => {
    setBlinds();
    dispatch(setActivePlayerByButton(currentButton));
  }, [currentButton]);

  const dealStreet = async () => {
    if (lastMove !== ActionType.FOLD) {
      switch (currentStreet) {
        case FLOP:
          await wait(500);
          dispatch(setPot());
          await wait(2000);
          dispatch(getFlop());
          await wait(500);
          dispatch(setActivePlayerByDealer());
          break;

        case TURN:
          await wait(500);
          dispatch(setPot());
          await wait(2000);
          dispatch(getTurn());
          await wait(500);
          dispatch(setActivePlayerByDealer());
          break;

        case RIVER:
          await wait(500);
          dispatch(setPot());
          await wait(2000);
          dispatch(getRiver());
          await wait(500);
          dispatch(setActivePlayerByDealer());
          break;

        case GETWINNER:
          await wait(500);
          dispatch(setPot());
          break;

        default:
          break;
      }
    }
  };

  const getWinner = async () => {
    if (lastMove === ActionType.FOLD && lastPlayer === PlayerType.VILLAIN) {
      setWinner(WinnerType.HERO);

      return;
    }

    if (
      lastPlayer === PlayerType.HERO
      && lastMove === ActionType.FOLD
    ) {
      setWinner(WinnerType.VILLAIN);

      return;
    }

    const heroFinalCombination = getCombination(board, heroHand);

    const villainFinalCombination = getCombination(board, villainHand);

    const handStrengths: string[] = [
      'highcard',
      'one pair',
      'two pair',
      'Trips',
      'straight',
      'flush',
      'full',
      'poker',
      'Straightflush',
    ];

    const villainValueOfCombination = handStrengths
      .findIndex(item => item === villainFinalCombination[0]);

    const heroValueOfCombination = handStrengths
      .findIndex(item => item === heroFinalCombination[0]);

    const checkWinnerByCombination = () => {
      if (villainValueOfCombination > heroValueOfCombination) {
        setWinner(WinnerType.VILLAIN);

        return;
      }

      if (heroValueOfCombination > villainValueOfCombination) {
        setWinner(WinnerType.HERO);
      }
    };

    const checkWinnerByHighCard = () => {
      let heroHigh = 0;
      let villainHigh = 0;

      for (let i = villainFinalCombination[1].length - 1; i > 0; i--) {
        if (villainFinalCombination[1][i] !== heroFinalCombination[1][i]) {
          heroHigh = heroFinalCombination[1][i];
          villainHigh = villainFinalCombination[1][i];
          break;
        }
      }

      if (heroHigh > villainHigh) {
        setWinner(WinnerType.HERO);
      } else if (villainHigh > heroHigh) {
        setWinner(WinnerType.VILLAIN);
      } else {
        setWinner(WinnerType.SPLIT);
      }
    };

    if (heroValueOfCombination !== villainValueOfCombination) {
      checkWinnerByCombination();

      return;
    }

    checkWinnerByHighCard();
  };

  const onHandIsOver = async (winner: WinnerType) => {
    dispatch(setPot());
    setDealCount(prev => prev + 1);
    await wait(3000);
    if (lastMove === ActionType.FOLD) {
      switch (lastPlayer) {
        case PlayerType.HERO:
          dispatch(villainWin());
          break;
        case PlayerType.VILLAIN:
          dispatch(heroWin());
          break;
        default:
          break;
      }
    } else {
      switch (winner) {
        case WinnerType.HERO:
          dispatch(heroWin());
          break;

        case WinnerType.VILLAIN:
          dispatch(villainWin());
          break;

        case WinnerType.SPLIT:
          dispatch(splitPot());
          break;
        default:
          break;
      }
    }

    await wait(2000);
    dispatch(onHandOverGameStates());
    dispatch(clearBoard());
    await wait(100);
    dispatch(setPotManually(0));
    dispatch(setHeroBetBox(0));
    dispatch(setVillainBetBox(0));
    await wait(100);
    DealCards();
    await wait(500);
    changeButton();
    setWinner(null);
  };

  useEffect(() => {
    getWinner();
  }, [currentStreet]);

  useEffect(() => {
    if (lastMove === ActionType.FOLD) {
      onHandIsOver(currentWinner as WinnerType);
    }
  }, [lastMove]);

  useEffect(() => {
    if (currentStreet === GETWINNER) {
      onHandIsOver(currentWinner as WinnerType);
    }
  }, [currentStreet]);

  useEffect(() => {
    if (currentStreet !== PREFLOP && currentStreet !== GETWINNER) {
      dealStreet();
    }
  }, [currentStreet]);

  useEffect(() => {
    if (dealcount === 0) {
      DealCards();
    }
  }, []);

  return (
    <div className="app-container">
      <VillainContainer />
      <TabeleBody />
      <HeroContainer />
      {(lastPlayer === PlayerType.HERO
      && lastMove === ActionType.NONE) && (
        <ActionButtons />
      )}
    </div>
  );
};

export default App;
