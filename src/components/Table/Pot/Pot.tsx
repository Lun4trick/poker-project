import React from 'react';
import { useAppSelector } from '../../../app/hooks';
import './pot.scss';

export const Pot: React.FC = () => {
  const potSize = useAppSelector(state => state.game.potSize);

  return (
    <>
      {potSize && (
        <div className="chip-heap">
          <div className="chips" />
          <p className="pot-size">{potSize}</p>
        </div>
      )}
    </>
  );
};
