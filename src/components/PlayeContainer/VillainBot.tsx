/* eslint-disable no-plusplus */
import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  setActivePlayerByDealer,
  setPlayerAction,
  setVillainBetBox,
} from '../../features/dealer/GameState';
import { getCombination } from '../../utils/functions/getCombination';
import {
  makePostFlopDecision,
} from '../../utils/functions/makePostFlopDecision';
import { wait } from '../../utils/functions/wait';
import { ActionType } from '../../utils/Types/ActionType';
import { Card } from '../../utils/Types/Card';
import { PlayerType } from '../../utils/Types/PlayerType';
import { StreetType } from '../../utils/Types/StreetType';
import PlayingCard from '../Card/Card';
import './PlayerContainer.scss';

enum PreHand {
  VALUERAISERANGE,
  SEMIBLUFFRANGE,
  CALLRANGE,
  TRASHRANGE,
}

export const VillainContainer: React.FC = () => {
  // Heros States
  const heroCards = useAppSelector(state => state.cards.heroHand);
  const [herosPreMove, saveHerosPreMove] = useState<ActionType>();
  const herosBet = useAppSelector(state => state.game.heroBetBox);
  // Villains States
  const holeCards = useAppSelector(state => state.cards.villainHand);
  const villainsChips = useAppSelector(state => state.game.villainsChips);
  const herosChips = useAppSelector(state => state.game.herosChips);
  const villainsBet = useAppSelector(state => state.game.villainBetBox);
  const [preRange, setPreRange] = useState<PreHand>();
  const isFacingBet = herosBet > villainsBet;
  const isPreFacingBet = (
    herosBet > villainsBet
    && herosPreMove === ActionType.BET
  );
  const [isAgressor, setIsAgressor] = useState(false);
  // Tables States
  const currentStreet = useAppSelector(state => state.game.currentStreet);
  const currentBoard = useAppSelector(state => state.cards.board);
  const currentDeck = useAppSelector(state => state.cards.shuffledDeck);
  const activePlayer = useAppSelector(state => state.game.activePlayer);
  const lastAction = useAppSelector(state => state.game.activePlayersMove);
  const currentButton = useAppSelector(state => state.game.currentButton);
  const remainingCards = [...currentDeck, ...heroCards];
  const currentPot = useAppSelector(state => state.game.potSize);
  const maxBet = (villainsChips + villainsBet) > (herosBet + herosChips)
    ? herosChips + herosBet
    : villainsChips + villainsBet;

  const dispatch = useAppDispatch();

  const someoneIsAllIn = herosChips === 0 || villainsChips === 0;

  const {
    VALUERAISERANGE,
    SEMIBLUFFRANGE,
    CALLRANGE,
    TRASHRANGE,
  } = PreHand;

  useEffect(() => {
    saveHerosPreMove(ActionType.NONE);
  }, [holeCards]);

  const onVillainAction = (amount: number, action: ActionType) => {
    dispatch(setVillainBetBox(amount));
    dispatch(setPlayerAction(action));
  };

  const getAllCombinations = () => {
    const combinations: Card[][] = [];

    for (let i = 0; i < remainingCards.length; i++) {
      for (let j = i + 1; j < remainingCards.length; j++) {
        combinations.push([remainingCards[i], remainingCards[j]]);
      }
    }

    return combinations;
  };

  const valueRange: Card[][] = [];
  const mixedValueRange: Card[][] = [];
  const limpRange: Card[][] = [];
  const weakRange: Card[][] = [];

  const createPreRanges = (combination: Card[]) => {
    const combinationIsConncetor = (
      ((combination[0].name - combination[1].name) <= 2)
      && (combination[0].name - combination[1].name) > 0)
  || (((combination[1].name - combination[0].name) <= 2)
        && (combination[1].name - combination[0].name) > 0);

    switch (true) {
      case (combination[0].name >= 12 && combination[1].name >= 12):
      case (
        (combination[0].name === combination[1].name)
        && combination[0].name > 7):
        valueRange.push(combination);
        break;
      case (
        combination.every(card => (card.name > 9))
          || (combinationIsConncetor
            && combination[0].color === combination[1].color)
            || combination[0].name === combination[1].name
      ):
        mixedValueRange.push(combination);
        break;
      case
        (combination[0].color === combination[1].color)
          || combinationIsConncetor
            || (combination[0].name > 11 || combination[1].name > 11):
        limpRange.push(combination);
        break;
      default:
        weakRange.push(combination);
        break;
    }
  };

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

  function getPreflopStrength(cardsOfV: Card[]) {
    const combinationIsConncetor = (
      ((cardsOfV[0].name - cardsOfV[1].name) <= 2)
      && (cardsOfV[0].name - cardsOfV[1].name) > 0)
  || (((cardsOfV[1].name - cardsOfV[0].name) <= 2)
        && (cardsOfV[1].name - cardsOfV[0].name) > 0);

    switch (true) {
      case (cardsOfV[0].name >= 12 && cardsOfV[1].name >= 12):
      case ((cardsOfV[0].name === cardsOfV[1].name) && cardsOfV[0].name > 7):
        setPreRange(VALUERAISERANGE);
        break;
      case (
        cardsOfV.every(card => (card.name > 9))
          || (combinationIsConncetor
            && cardsOfV[0].color === cardsOfV[1].color)
            || cardsOfV[0].name === cardsOfV[1].name
      ):
        setPreRange(SEMIBLUFFRANGE);
        break;
      case
        (cardsOfV[0].color === cardsOfV[1].color)
          || combinationIsConncetor
            || (cardsOfV[0].name > 11 || cardsOfV[1].name > 11):
        setPreRange(CALLRANGE);
        break;
      default:
        setPreRange(TRASHRANGE);
        break;
    }
  }

  function preFlopDecision() {
    const randomNumber = Math.random() * 100;

    const getRaiseSize = () => {
      switch (true) {
        case (herosBet * 3) > (villainsChips + villainsBet) / 2:
        case (herosBet * 3) > (herosBet + herosChips) / 2:
          return maxBet;
        default:
          return herosBet * 3;
      }
    };

    const raiseSize = getRaiseSize();

    if (
      lastAction !== ActionType.CALL
      && currentButton !== PlayerType.VILLAIN
    ) {
      switch (preRange) {
        case (VALUERAISERANGE):
          if (!someoneIsAllIn) {
            onVillainAction(raiseSize, ActionType.BET);
            setIsAgressor(true);
          }

          break;
        case (SEMIBLUFFRANGE):
          if (randomNumber < 40 && !someoneIsAllIn) {
            onVillainAction(raiseSize, ActionType.BET);
            setIsAgressor(true);
          } else {
            onVillainAction(herosBet, ActionType.CALL);
            setIsAgressor(false);
          }

          break;
        case (CALLRANGE):
          if (herosBet > villainsBet) {
            onVillainAction(herosBet, ActionType.CALL);
            setIsAgressor(false);
          } else {
            onVillainAction(herosBet, ActionType.CHECK);
          }

          break;

        default:
          onVillainAction(herosBet, ActionType.FOLD);
      }
    } else if (!isPreFacingBet) {
      switch (preRange) {
        case (VALUERAISERANGE):
          onVillainAction(raiseSize, ActionType.BET);
          setIsAgressor(true);
          break;
        case (SEMIBLUFFRANGE):
          if (randomNumber < 40) {
            onVillainAction(raiseSize, ActionType.BET);
            setIsAgressor(true);
          } else {
            onVillainAction(herosBet, ActionType.LIMP);
            setIsAgressor(true);
          }

          break;
        case (CALLRANGE):
          if (herosBet > villainsBet) {
            onVillainAction(herosBet, ActionType.LIMP);
            setIsAgressor(true);
          } else {
            onVillainAction(herosBet, ActionType.CHECK);
          }

          break;

        default:
          onVillainAction(herosBet, ActionType.LIMP);
      }
    } else {
      switch (preRange) {
        case (VALUERAISERANGE):
          onVillainAction(herosBet * 2.5, ActionType.BET);
          setIsAgressor(true);
          break;
        case (SEMIBLUFFRANGE):
          if (randomNumber < 40) {
            onVillainAction(herosBet * 3, ActionType.BET);
            setIsAgressor(true);
          } else {
            onVillainAction(herosBet, ActionType.CALL);
            setIsAgressor(true);
          }

          break;
        case (CALLRANGE):
          if (herosBet > villainsBet) {
            onVillainAction(herosBet, ActionType.CALL);
            setIsAgressor(true);
          } else {
            onVillainAction(herosBet, ActionType.CHECK);
          }

          break;

        default:
          onVillainAction(herosBet, ActionType.FOLD);
      }
    }

    dispatch(setActivePlayerByDealer());
  }

  const calculateEquity = (opponentRange: Card[][],
    remainCards: Card[]): number => {
    let wins = 0;
    let losses = 0;

    if (currentStreet !== StreetType.RIVER) {
      remainCards.forEach((nextStreet: Card) => {
        opponentRange.forEach((card: Card[]) => {
          const villainFinalCombination = getCombination(
            [...currentBoard, nextStreet], holeCards,
          );
          const villainCombination = handStrengths
            .findIndex(item => item === villainFinalCombination[0]);
          const opponentStrength = getCombination(
            [...currentBoard, nextStreet], card,
          );
          const opponentStrengthValue = handStrengths
            .findIndex(item => item === opponentStrength[0]);

          if (villainCombination > opponentStrengthValue) {
            wins++;
          }

          if (opponentStrengthValue > villainCombination) {
            losses++;
          }

          if (opponentStrengthValue === villainCombination) {
            let heroHigh = 0;
            let villainHigh = 0;

            for (let i = villainFinalCombination[1].length - 1; i > 0; i--) {
              if (villainFinalCombination[1][i] !== opponentStrength[1][i]) {
                heroHigh = opponentStrength[1][i];
                villainHigh = villainFinalCombination[1][i];
                break;
              }
            }

            if (heroHigh > villainHigh) {
              losses++;
            } else if (villainHigh > heroHigh) {
              wins++;
            }
          }
        });
      });
    } else {
      opponentRange.forEach((card: Card[]) => {
        const villainFinalCombination = getCombination(
          [...currentBoard], holeCards,
        );
        const villainCombination = handStrengths
          .findIndex(item => item === villainFinalCombination[0]);
        const opponentStrength = getCombination(
          [...currentBoard], card,
        );
        const opponentStrengthValue = handStrengths
          .findIndex(item => item === opponentStrength[0]);

        if (villainCombination > opponentStrengthValue) {
          wins++;
        }

        if (opponentStrengthValue > villainCombination) {
          losses++;
        }

        if (opponentStrengthValue === villainCombination) {
          let heroHigh = 0;
          let villainHigh = 0;

          for (let i = villainFinalCombination[1].length - 1; i > 0; i--) {
            if (villainFinalCombination[1][i] !== opponentStrength[1][i]) {
              heroHigh = opponentStrength[1][i];
              villainHigh = villainFinalCombination[1][i];
              break;
            }
          }

          if (heroHigh > villainHigh) {
            losses++;
          } else if (villainHigh > heroHigh) {
            wins++;
          }
        }
      });
    }

    const equity = (wins / ((wins + losses) / 100));

    return equity;
  };

  useEffect(() => {
    if ((activePlayer === PlayerType.HERO)
      && (currentStreet === StreetType.PREFLOP)) {
      saveHerosPreMove(lastAction as ActionType);
    }
  }, [activePlayer, lastAction]);

  const decisionSequencePost = async () => {
    getAllCombinations().forEach(combination => createPreRanges(combination));
    const betRange: Card[][] = [...valueRange, ...mixedValueRange];
    const callRange: Card[][] = mixedValueRange;
    const weakestRange: Card[][] = [...limpRange, ...weakRange];

    let currentRange: Card[][] = [];

    await wait(1000);
    switch (herosPreMove) {
      case ActionType.BET:
        currentRange = betRange;
        break;
      case ActionType.CALL:
        currentRange = callRange;
        break;
      case ActionType.LIMP:
      case ActionType.CHECK:
        currentRange = weakestRange;
        break;
      default:
        break;
    }

    await wait(500);
    const eq = calculateEquity(currentRange, remainingCards);

    await wait(500);
    let decision = makePostFlopDecision(eq, isAgressor, isFacingBet);

    if (decision === ActionType.BET && someoneIsAllIn) {
      decision = ActionType.CALL;
    }

    await wait(500);

    const getRaiseSize = () => {
      switch (true) {
        case (herosBet * 3) > (villainsChips + villainsBet) / 2:
          return villainsBet + villainsChips;
        case (herosBet * 3) > (herosBet + herosChips) / 2:
          return herosChips + herosBet;
        default:
          return herosBet * 3;
      }
    };

    const raiseSize = getRaiseSize();
    const probeSize = (
      Math.floor(currentPot * 0.7) > maxBet
    )
      ? maxBet
      : Math.floor(currentPot * 0.7);

    switch (decision) {
      case ActionType.BET:
        if (isFacingBet) {
          onVillainAction(raiseSize, decision);
        } else {
          onVillainAction(probeSize, decision);
        }

        break;
      case ActionType.CALL:
        onVillainAction(herosBet, decision);
        break;
      case ActionType.CHECK:
        onVillainAction(0, decision);
        break;
      case ActionType.FOLD:
        onVillainAction(0, decision);
        break;

      default:
        onVillainAction(0, ActionType.CHECK);
        break;
    }

    await wait(500);
    dispatch(setActivePlayerByDealer());
  };

  useEffect(() => {
    if (holeCards.length > 0) {
      getPreflopStrength(holeCards);
    }
  }, [holeCards]);

  useEffect(() => {
    if (
      activePlayer === PlayerType.VILLAIN
      && currentStreet !== StreetType.PREFLOP
      && currentStreet !== StreetType.GETWINNER
    ) {
      decisionSequencePost();
    } else if (
      activePlayer === PlayerType.VILLAIN
      && currentStreet === StreetType.PREFLOP
    ) {
      preFlopDecision();
    }
  }, [activePlayer]);

  const isVillainMadeAction = (
    activePlayer === PlayerType.VILLAIN && lastAction !== ActionType.NONE);

  return (
    <div className="player-info">
      <h2 className="player-info__name">
        {isVillainMadeAction
          ? lastAction
          : 'Villain'}
      </h2>
      <h2 className="player-info__chips">{villainsChips}</h2>
      <div className="player-info__holeCards">
        {holeCards.map(card => (
          <PlayingCard key={card.value + card.color} card={card} />
        ))}
      </div>
    </div>
  );
};
