import React from 'react';
import { Board } from '../Board/Board';
import { HeroBetBox } from '../PlayerBetBox/HeroBetBox';
import { VillainBetBox } from '../PlayerBetBox/VillainBetBox';
import { Pot } from '../Pot/Pot';
import './tableBody.scss';

export const TabeleBody: React.FC = () => (
  <div className="table">
    <VillainBetBox />
    <Board />
    <Pot />
    <HeroBetBox />
  </div>
);
