import React from 'react';
import { useAppSelector } from '../../../app/hooks';
import { PlayerType } from '../../../utils/Types/PlayerType';
import './playerBetBox.scss';

export const VillainBetBox: React.FC = () => {
  const villainBet = useAppSelector(state => state.game.villainBetBox);
  const currenButton = useAppSelector(state => state.game.currentButton);
  const isButton = currenButton === PlayerType.VILLAIN;

  return (
    <div className="bet-box">
      {isButton && (
        <div className="dealer-button">
          D
        </div>
      )}
      {villainBet > 0 && (
        <div className="bet-amount">
          <div className="bet-chips" />
          <p>
            {villainBet}
          </p>
        </div>
      )}
    </div>
  );
};
