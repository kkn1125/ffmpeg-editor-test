import { Route, Routes } from "react-router-dom";
import Layout from "./components/templates/Layout";
import logo from "./logo.svg";
import Home from "./pages/Home";

function App() {
  return (
    <Routes>
      <Route path='/' element={<Layout />}>
        <Route path='' element={<Home />} />
      </Route>
    </Routes>
  );
}

export default App;
