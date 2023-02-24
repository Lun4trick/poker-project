import React from 'react';
import { useAppSelector } from '../../app/hooks';
import PlayingCard from '../Card/Card';
import './PlayerContainer.scss';

export const HeroContainer: React.FC = () => {
  const heroHoleCards = useAppSelector(state => state.cards.heroHand);
  const herosChips = useAppSelector(state => state.game.herosChips);

  return (
    <div className="player-info player-info--is-active">
      <h2 className="player-info__name">Hero</h2>
      <h2 className="player-info__chips">{herosChips}</h2>
      {heroHoleCards && (
        <div className="player-info__holeCards">
          {heroHoleCards.map(card => (
            <PlayingCard key={card.value + card.color} card={card} />
          ))}
        </div>
      )}
    </div>
  );
};
