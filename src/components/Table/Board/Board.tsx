import React from 'react';
import PlayingCard from '../../Card/Card';
import './board.scss';
import { useAppSelector } from '../../../app/hooks';

export const Board: React.FC = () => {
  const board = useAppSelector(state => state.cards.board);

  return (
    <div className="board">
      {board.map(card => (
        <PlayingCard
          key={card.value + card.color}
          card={card}
        />
      ))}
    </div>
  );
};
