import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import NavigateService from "./components/NavigateService";
import Finetuning from "./pages/FineTuning";
import { FinetuningProvider } from "./context/fineTuningContext";


function App() {
  return (
    <FinetuningProvider>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/NavigateService" element={<NavigateService />} />
      <Route path="/FineTuning" element={<Finetuning />} />
    </Routes>
    </FinetuningProvider>
  );
}

export default App;
