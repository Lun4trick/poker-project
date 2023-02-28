import { useAppSelector } from '../../app/hooks';
import './gamesWonCounter.scss';

export const GamesWonCounter: React.FC = () => {
  const villainsWon = useAppSelector(state => state.game.gamesWonByVillain);
  const herosWon = useAppSelector(state => state.game.gamesWonByHero);

  return (
    <div className="counter_box">
      {`Villain: ${villainsWon}`}
      <br />
      {`Hero: ${herosWon}`}
    </div>
  );
};
