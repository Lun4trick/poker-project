import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import {
  setActivePlayerByDealer,
  setHeroBetBox,
  setPlayerAction,
} from '../../features/dealer/GameState';
import { wait } from '../../utils/functions/wait';
import { ActionType } from '../../utils/Types/ActionType';
import { PlayerType } from '../../utils/Types/PlayerType';
import { StreetType } from '../../utils/Types/StreetType';
import './actionButtons.scss';

export const ActionButtons: React.FC = () => {
  const currentStreet = useAppSelector(state => state.game.currentStreet);
  const board = useAppSelector(state => state.cards.board);
  const dispatch = useAppDispatch();
  const villainsBet = useAppSelector(state => state.game.villainBetBox);
  const herosBet = useAppSelector(state => state.game.heroBetBox);
  const activePlayer = useAppSelector(state => state.game.activePlayer);
  const lastMove = useAppSelector(state => state.game.activePlayersMove);
  const heroChips = useAppSelector(state => state.game.herosChips);
  const villainChips = useAppSelector(state => state.game.villainsChips);
  const currentButton = useAppSelector(state => state.game.currentButton);
  const allChipsOfHero = herosBet + heroChips;
  const allVillainsChips = villainChips + villainsBet;
  const maxBet = (allVillainsChips) > (allChipsOfHero)
    ? allChipsOfHero
    : allVillainsChips;
  const [minBet, setMinBet] = useState(200);
  const [currentBet, setCurrentBet] = useState(minBet);

  useEffect(() => {
    switch (true) {
      case villainsBet * 2 > maxBet:
        setMinBet(maxBet);
        setCurrentBet(maxBet);
        break;
      case (villainsBet * 2 < maxBet) && (villainsBet > 0):
        setMinBet(villainsBet * 2);
        setCurrentBet(villainsBet * 2);
        break;
      default:
        setMinBet(100);
        setCurrentBet(100);
    }
  }, [villainsBet, lastMove]);

  const isSomeoneAllIn = (
    (heroChips === 0 && herosBet === 0)
    || (villainChips === 0 && villainsBet === 0)
  );

  const betButtonHandler = async () => {
    dispatch(setHeroBetBox(currentBet));
    await wait(500);
    dispatch(setPlayerAction(ActionType.BET));
    await wait(500);
    dispatch(setActivePlayerByDealer());
  };

  const callCheckButtonHandler = async () => {
    if (
      (villainsBet > herosBet)
      && currentStreet === StreetType.PREFLOP
      && herosBet === 50
      && currentButton === PlayerType.HERO
    ) {
      dispatch(setHeroBetBox(villainsBet));
      dispatch(setPlayerAction(ActionType.LIMP));
    } else if (villainsBet > herosBet) {
      dispatch(setHeroBetBox(villainsBet));
      dispatch(setPlayerAction(ActionType.CALL));
    } else {
      dispatch(setPlayerAction(ActionType.CHECK));
    }

    await wait(500);
    dispatch(setActivePlayerByDealer());
  };

  useEffect(() => {
    if (isSomeoneAllIn) {
      callCheckButtonHandler();
    }
  }, [board]);

  return (
    <div className={
      (activePlayer === PlayerType.HERO
      && !isSomeoneAllIn
      && lastMove === ActionType.NONE)
        ? ''
        : 'is-invisible'
    }
    >
      <div className="slider-container">
        <div className="slider">
          <input
            className="slider is-fullwidth is-large is-danger is-circle"
            step={5}
            min={minBet}
            max={maxBet}
            type="range"
            value={currentBet}
            onChange={(event) => (
              setCurrentBet(Number(event.target.value))
            )}
          />
        </div>
      </div>
      <div className="actionButtons buttons are-large">
        <button
          type="button"
          className="action-button button is-link is-responsive"
          onClick={() => {
            dispatch(setPlayerAction(ActionType.FOLD));
          }}
        >
          Fold
        </button>
        <button
          type="button"
          className="action-button button is-success is-responsive"
          onClick={callCheckButtonHandler}
        >
          {villainsBet > herosBet
            ? 'Call'
            : 'Check'}
        </button>
        {(
          allChipsOfHero > villainsBet
          && villainChips > 0) && (
          <button
            type="button"
            className="action-button button is-danger is-responsive"
            onClick={betButtonHandler}
          >
            {
              (villainsBet > 0)
                ? currentBet || 'Raise'
                : currentBet || 'Bet'
            }
          </button>
        )}
      </div>
    </div>
  );
};
