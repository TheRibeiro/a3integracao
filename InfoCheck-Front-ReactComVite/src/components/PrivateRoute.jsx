import { Navigate } from "react-router-dom";

function PrivateRoute({ children }) {
  const stored = localStorage.getItem("usuarioLogado");

  if (!stored) {
    return <Navigate to="/login" replace />;
  }

  try {
    JSON.parse(stored);
  } catch (error) {
    console.error("Sessão inválida, limpando storage:", error);
    localStorage.removeItem("usuarioLogado");
    return <Navigate to="/login" replace />;
  }

  return children;
}

export default PrivateRoute;
