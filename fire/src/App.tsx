import "./App.css";
import Editor from "./routes/editor";
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";
import About from "./routes/about";

function App() {
  return (
    <Router>
      <Switch>
        <Route path="/about">
          <About></About>
        </Route>
        <Route path="/">
          <Editor></Editor>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
