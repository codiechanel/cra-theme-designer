import React from "react";
// import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Home from "./Home";

function App() {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
