import './App.css';
import React from 'react';
import MediaPool from './components/mediaPool';
import { Link, Route, Switch } from 'react-router-dom';
import About from './components/about';
import { BrowserRouter as Router } from 'react-router-dom';

class App extends React.Component {
  render() {
    return (
      <Router>
        <Switch>
          <Route exact path="/">
            <div class="body">
              <MediaPool />
              <div class="App">
                <div class="VideoPlayer"></div>
                <div class="VideoTimeline"></div>
              </div>

            </div>

          </Route>

          <Route path="/about" component={About}>
          </Route>

        </Switch>
      </Router>
    );
  }
}


export default App;