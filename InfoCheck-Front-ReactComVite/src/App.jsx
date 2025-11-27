import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import FeedAlertas from "./pages/FeedAlertas";
import GolpesPorBanco from "./pages/GolpesPorBanco";
import Estatisticas from "./pages/Estatisticas";
import DenunciaElaborada from "./pages/DenunciaElaborada";
import VerificarContato from "./pages/VerificarContato";
import Login from "./pages/Login";
import Registro from "./pages/Registro";
import Dashboard from "./pages/Dashboard";
import CadastroEmpresa from "./pages/CadastroEmpresa";
import PrivateRoute from "./components/PrivateRoute";
import "./styles/styles.css";

function App() {
  return (
    
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/feed-alertas" element={<FeedAlertas />} />
        <Route path="/verificar-contato" element={<VerificarContato />} />
        <Route path="/golpes-por-banco" element={<GolpesPorBanco />} />
        <Route path="/golpes-por-banco/:idBanco" element={<GolpesPorBanco />} />
        <Route path="/estatisticas" element={<Estatisticas />} />
        <Route path="/cadastroempresa" element={<CadastroEmpresa />} />
        <Route
          path="/denuncia-elaborada"
          element={
            <PrivateRoute>
              <DenunciaElaborada />
            </PrivateRoute>
          }
        />
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Registro />} />
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    
  );
}

export default App;
