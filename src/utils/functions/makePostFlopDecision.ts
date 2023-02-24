import { ActionType } from '../Types/ActionType';

export function makePostFlopDecision(
  equity: number,
  isAgressor: boolean,
  isFacingBet: boolean,
) {
  if (!isAgressor && !isFacingBet) {
    return ActionType.CHECK;
  }

  // const potOdds = (currentBet / (currentBet + currentPot)) * 100;

  const randomNumber = Math.random() * 100;

  if (isFacingBet) {
    switch (true) {
      case equity > 85:
      case equity > 70 && randomNumber > 10:
      case equity > 50 && randomNumber > 60:
      case equity > 30 && randomNumber > 80:
        return ActionType.BET;
      case equity < 15:
        return ActionType.FOLD;
      default:
        return ActionType.CALL;
    }
  } else if (isAgressor) {
    switch (true) {
      case equity < 15:
      case equity > 85:
      case equity > 70:
      case equity > 50:
      case equity > 30:
        return ActionType.BET;
      default:
        return ActionType.CHECK;
    }
  } else {
    switch (true) {
      case equity > 85 && randomNumber > 80:
      case equity > 70 && randomNumber > 10:
      case equity > 50 && randomNumber > 70:
      case equity > 30:
        return ActionType.BET;
      default:
        return ActionType.CHECK;
    }
  }
}
