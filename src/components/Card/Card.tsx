import React from 'react';
import { Card } from '../../utils/Types/Card';
import './card.scss';
import { useAppSelector } from '../../app/hooks';

type Props = {
  card: Card;
}
const PlayingCard: React.FC<Props> = ({ card }) => {
  const {
    value,
    color,
  } = card;

  // eslint-disable-next-line consistent-return
  const getCardSymbol = () => {
    switch (color) {
      case 's':
        return '♠';
      case 'h':
        return '♥';
      case 'd':
        return '♦';
      case 'c':
        return '♣';
      default:
        return '♣';
    }
  };

  const villainCards = useAppSelector(state => state.cards.villainHand);
  const isVillainCard = villainCards.includes(card);
  const cardSymbol = getCardSymbol();

  return (
    <div className={`card card--${
      isVillainCard
        ? 'hidden'
        : card.color
    }`}
    >
      {!isVillainCard && (
        <>
          <div className="card__rank">{value}</div>
          <div className="card__suit">{cardSymbol}</div>
        </>
      )}
    </div>
  );
};

export default PlayingCard;
