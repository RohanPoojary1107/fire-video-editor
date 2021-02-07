import logo from './logo.svg';
import './App.css';
import React from 'react';
import MediaPool from './components/mediaPool';

class App extends React.Component {
  render(){ 
    return (
      <div className="App" >
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <MediaPool />
        </header>
      </div>
    );
  }
}


export default App;
