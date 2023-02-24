import React from 'react';
import { useAppSelector } from '../../../app/hooks';
import { PlayerType } from '../../../utils/Types/PlayerType';
import './playerBetBox.scss';

export const HeroBetBox: React.FC = () => {
  const heroBet = useAppSelector(state => state.game.heroBetBox);
  const currenButton = useAppSelector(state => state.game.currentButton);
  const isButton = currenButton === PlayerType.HERO;

  return (
    <div className="bet-box">
      {isButton && (
        <div className="dealer-button">
          D
        </div>
      )}
      {heroBet > 0 && (
        <div className="bet-amount">
          {heroBet}
        </div>
      )}
    </div>
  );
};
