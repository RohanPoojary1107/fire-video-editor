import logo from './logo.svg';
import './App.css';
import React from 'react';
import Button from './components/button'

class App extends React.Component {
  constructor(props) {
    super(props);
    this.files = [];
    this.getFileName = this.getFileName.bind(this);
  }

  getFileName(file_name){
    this.files.push(file_name);  // a list of names of files
    console.log(this.files);
  }

  render(){
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <Button 
          id='getFiles' 
          value='click here to select files'
          rtn={this.getFileName} 
          />
        </header>
      </div>
    );
  }
}


export default App;
