import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { HomePage, CompressPage } from "./pages"

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/compress" element={<CompressPage />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;