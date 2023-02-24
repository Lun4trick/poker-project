/* eslint-disable no-plusplus */
import { Card } from '../Types/Card';
import { Combination } from '../Types/Combination';

// eslint-disable-next-line no-debugger

const getStraightCards = (arr: number[]): [boolean, number[]] => {
  let count = 1;
  const result: number[] = [];

  for (let i = arr.length - 1; i > 0; i--) {
    if (arr[i] - 1 === arr[i - 1]) {
      result.push(arr[i]);
      count++;
      if (count === 5) {
        return [true, [...result, arr[i - 1]].reverse()];
      }
    } else if (arr[i] !== arr[i - 1]) {
      count = 1;
    }
  }

  return [false, [0]];
};

const getMultiplications = (
  values: number[],
  highCardsNeed: number,
): number[] => {
  const trips = values.filter(
    (item) => values.indexOf(item) !== values.lastIndexOf(item),
  );

  // eslint-disable-next-line max-len
  const highCards = values.filter(item => !trips.includes(item)).splice(0 - highCardsNeed);

  trips.forEach((item, index) => {
    trips[index] = item;
  });
  const result: number[] = [...highCards, ...trips];

  return result;
};

const getPokerCards = (values: number[]): number[] => {
  return [
    Math.max(...values.filter((
      (item, index) => index === values.lastIndexOf(item)))),
    ...values.filter((
      (item) => values.indexOf(item) !== values.lastIndexOf(item))),
  ];
};

const getFullCards = (values: number[]): number[] => {
  const trips = values
    .find((item, index) => item === values[index + 2]);

  const full: number[] = [];

  values.forEach(item => {
    if (item === trips) {
      full.push(item);
    } else {
      full.unshift(item);
    }
  });

  return full.splice(-5);
};

const getFlushCards = (hand: Card[]) => {
  const colors: string[] = hand.map(item => item.color).sort();
  const currentFlush = colors.find(
    (item => item === colors[colors.indexOf(item) + 4]),
  );
  const result: number[] = [];

  hand.forEach(item => {
    if (item.color === currentFlush) {
      result.push(item.name);
    }
  });

  result.sort((a, b) => a - b);

  return result.length > 5
    ? result.splice(-5)
    : result;
};

export function getCombination(
  board: Card[],
  playerHand: Card[],
): Combination {
  const hand: Card[] = [...board, ...playerHand];
  const sortedHand = hand.sort((a, b) => a.name - b.name);

  const colors: string[] = sortedHand.map(item => item.color).sort();
  const values: number[] = sortedHand.map(item => item.name);

  // const values = [2, 2, 2, 9, 9, 10, 14];

  const pairs = values.filter(item => (
    (values.indexOf(item) + 1 === values.lastIndexOf(item))
  ));

  const isFlush = colors.some((
    (item => item === colors[colors.indexOf(item) + 4])
  ));

  const isPoker = values.some(item => (
    (values.lastIndexOf(item) - values.indexOf(item) === 3)
  ));

  const isTrips = values.some(item => (
    (values.lastIndexOf(item) - values.indexOf(item) === 2)
  ));

  const isStraightFlush = getStraightCards(values)[1]
    .every(item => getFlushCards(sortedHand).includes(item));

  const isStraight = getStraightCards(values)[0];

  const isTwoPair = pairs.length >= 4;

  const isOnePair = pairs.length === 2;

  const isFull = (isTrips && pairs.length > 0);

  switch (true) {
    case (isStraightFlush):
      return [
        'Straightflush',
        getFlushCards(sortedHand),
      ];

    case (isPoker):
      return [
        'poker',
        getPokerCards(values),
      ];

    case (isFull):
      return [
        'full',
        getFullCards(values),
      ];

    case (isFlush):
      return [
        'flush',
        getFlushCards(sortedHand),
      ];

    case (isStraight):
      return [
        'straight',
        getStraightCards(values)[1],
      ];

    case (isTrips):
      return [
        'Trips',
        getMultiplications(values, 2),

      ];

    case (isTwoPair):
      return [
        'two pair',
        getMultiplications(values, 1).splice(-5),

      ];

    case (isOnePair):
      return [
        'one pair',
        getMultiplications(values, 3),

      ];

    default:
      return [
        'highcard',
        values.splice(-5),

      ];
  }
}
