import React from 'react';
import Regular from 'components/Regular/Regular';       // custom component
import MuiVersion from 'components/muiVersion/MuiVersion';
import './App.scss';

function App() {
  return (
    <div className='App'>
      <h1>MERN IMAGE UPLOAD</h1>
      <Regular/>
      <MuiVersion/>
    </div>
  );
}

export default App;