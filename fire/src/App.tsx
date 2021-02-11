import "./App.css";
import Editor from "./routes/editor";
import {
  BrowserRouter as Router,
  Switch,
  Route,
} from "react-router-dom";


function App() {
  return (
    <Router>
      <Switch>
        <Route path="/">
          <Editor></Editor>
        </Route>
      </Switch>
    </Router>
  );
}

export default App;
