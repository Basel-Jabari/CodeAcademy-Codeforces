import React, {ReactElement} from 'react';
import Home from './Home';
import {getPromblemsListFromStorage} from '../lib/storage/domain/storage';

const App: React.FC<{}> = (): ReactElement => {
  const problemsList = getPromblemsListFromStorage();
  return <Home initialProblemsList={problemsList}></Home>;
};

export default App;
