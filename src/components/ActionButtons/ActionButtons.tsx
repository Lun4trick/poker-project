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
  const dispatch = useAppDispatch();
  const villainsBet = useAppSelector(state => state.game.villainBetBox);
  const herosBet = useAppSelector(state => state.game.heroBetBox);
  const minBet = villainsBet
    ? villainsBet * 2
    : 100;
  const heroChips = useAppSelector(state => state.game.herosChips);
  const villainChips = useAppSelector(state => state.game.villainsChips);
  const [currentBet, setCurrentBet] = useState(minBet);
  const currentButton = useAppSelector(state => state.game.currentButton);

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
  }, [currentStreet]);

  return (
    <>
      <div className="slider-container">
        <div className="slider">
          <input
            className="slider is-fullwidth is-large is-danger is-circle"
            step={5}
            min={minBet}
            max={heroChips + herosBet}
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
          className="action-button button is-danger is-responsive"
          onClick={betButtonHandler}
        >
          {
            (villainsBet > 0)
              ? currentBet || 'Raise'
              : currentBet || 'Bet'
          }
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

        <button
          type="button"
          className="action-button button is-link is-responsive"
          onClick={() => {
            dispatch(setPlayerAction(ActionType.FOLD));
          }}
        >
          Fold
        </button>
      </div>
    </>
  );
};
