import deck from '../vars/Deck';
import { Card } from '../Types/Card';

export function shuffleDeck(): Card[] {
  const shuffledDeck: Card[] = [];

  while (shuffledDeck.length < 52) {
    const randomNumber = Math.round(Math.random() * 12);
    const randomColor = Math.round(Math.random() * 3);

    if (!shuffledDeck.includes(deck[randomNumber][randomColor])) {
      shuffledDeck.push(deck[randomNumber][randomColor]);
    }
  }

  return shuffledDeck;
}
