import './App.css';
import React from 'react';
import MediaPool from './components/mediaPool';

class App extends React.Component {
  render(){ 
    return (
      <div class="body">
        <MediaPool/>
      <div class="App">
          <div class="VideoPlayer"></div>
          <div class="VideoTimeline"></div>
      </div>
      </div>
    );
  }
}


export default App;