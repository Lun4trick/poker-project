import React, { useState } from 'react';
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
  const minBet = villainsBet * 2;
  const heroChips = useAppSelector(state => state.game.herosChips);
  const [currentBet, setCurrentBet] = useState(minBet);
  // const activePlayer = useAppSelector(state => state.game.activePlayer);
  // const lastAction = useAppSelector(state => state.game.activePlayersMove);
  // const [lastVillainAction, setLastVillainAction] = useState<ActionType>();
  const currentButton = useAppSelector(state => state.game.currentButton);

  // useEffect(() => {
  //   if (activePlayer === PlayerType.VILLAIN) {
  //     setLastVillainAction(lastAction);
  //   }
  // }, [lastAction]);

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

  return (
    <div className="actionButtons buttons are-large">
      <div className="slider">
        <input
          className="slider is-fullwidth is-large is-danger is-circle"
          min={minBet}
          max={heroChips}
          type="range"
          value={currentBet}
          onChange={(event) => (
            setCurrentBet(Number(event.target.value))
          )}
        />
      </div>
      <button
        type="button"
        className="action-button button is-danger"
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
        className="action-button button is-success"
        onClick={callCheckButtonHandler}
      >
        {villainsBet > herosBet
          ? 'Call'
          : 'Check'}
      </button>

      <button
        type="button"
        className="action-button button is-link"
        onClick={() => {
          dispatch(setPlayerAction(ActionType.FOLD));
        }}
      >
        Fold
      </button>
    </div>
  );
};
