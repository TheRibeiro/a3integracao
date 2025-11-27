// src/pages/VerificarContato.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../api";
import ErrorModal from "../components/ErrorModal";
import "../styles/VerificarContato.css";

function VerificarContato() {
  const navigate = useNavigate();
  const [contato, setContato] = useState("");
  const [resultado, setResultado] = useState(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [modalErroAberto, setModalErroAberto] = useState(false);

  const normalizarContato = (valor) => {
    // Remove espaços, traços, parênteses, pontos
    return valor.replace(/[\s\-\(\)\.]/g, "");
  };

  const handleVerificar = async (e) => {
    e.preventDefault();
    setErro("");
    setResultado(null);

    const contatoNormalizado = normalizarContato(contato.trim());

    if (!contatoNormalizado) {
      setErro("Por favor, digite um número ou contato para verificar");
      setModalErroAberto(true);
      return;
    }

    setCarregando(true);

    try {
      const response = await apiGet(
        `/api/denuncias/contato/${encodeURIComponent(contatoNormalizado)}`
      );
      setResultado(response);
    } catch (error) {
      console.error("Erro ao verificar contato:", error);
      setErro(error.message || "Erro ao verificar contato. Tente novamente.");
      setModalErroAberto(true);
    } finally {
      setCarregando(false);
    }
  };

  const getConfiabilidadeClass = (confiabilidade) => {
    if (!confiabilidade) return "confiabilidade-neutro";
    const texto = confiabilidade.toLowerCase();
    if (texto.includes("sem denúncias")) return "confiabilidade-seguro";
    if (texto.includes("atenção")) return "confiabilidade-atencao";
    if (texto.includes("risco") && !texto.includes("alto")) return "confiabilidade-risco";
    if (texto.includes("alto risco")) return "confiabilidade-alto-risco";
    return "confiabilidade-neutro";
  };

  const getIconeConfiabilidade = (confiabilidade) => {
    if (!confiabilidade) return null;
    const texto = confiabilidade.toLowerCase();

    if (texto.includes("sem denúncias")) {
      return (
        <svg className="icone-resultado icone-seguro" viewBox="0 0 24 24" fill="none">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
    if (texto.includes("atenção")) {
      return (
        <svg className="icone-resultado icone-atencao" viewBox="0 0 24 24" fill="none">
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      );
    }
    return (
      <svg className="icone-resultado icone-perigo" viewBox="0 0 24 24" fill="none">
        <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
  };

  return (
    <div className="verificar-contato-container">
      <div className="verificar-header">
        <button className="btn-voltar" onClick={() => navigate("/")}>
          <svg viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Voltar
        </button>
        <h1>Verificar Contato</h1>
      </div>

      <div className="verificar-content">
        <div className="verificar-card">
          <div className="card-header">
            <svg className="header-icon" viewBox="0 0 24 24" fill="none">
              <path d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div>
              <h2>Verificação de Contato</h2>
              <p>Digite um número de telefone ou identificador para verificar se há denúncias</p>
            </div>
          </div>

          <form onSubmit={handleVerificar} className="verificar-form">
            <div className="form-group">
              <label htmlFor="contato">Número ou Contato</label>
              <input
                type="text"
                id="contato"
                placeholder="Ex: (11) 99999-9999 ou email@exemplo.com"
                value={contato}
                onChange={(e) => setContato(e.target.value)}
                disabled={carregando}
              />
            </div>

            <button type="submit" className="btn-verificar" disabled={carregando}>
              {carregando ? (
                <>
                  <div className="spinner"></div>
                  Verificando...
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  Verificar Contato
                </>
              )}
            </button>
          </form>

          {resultado && (
            <div className="resultado-container">
              <div className={`resultado-card ${getConfiabilidadeClass(resultado.confiabilidade)}`}>
                {getIconeConfiabilidade(resultado.confiabilidade)}
                <h3>Resultado da Verificação</h3>
                <div className="resultado-info">
                  <div className="info-item">
                    <span className="info-label">Contato verificado:</span>
                    <span className="info-valor">{resultado.contato}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Total de denúncias:</span>
                    <span className="info-valor destaque">{resultado.totalDenuncias}</span>
                  </div>
                  <div className="info-item">
                    <span className="info-label">Nível de confiabilidade:</span>
                    <span className={`info-valor badge ${getConfiabilidadeClass(resultado.confiabilidade)}`}>
                      {resultado.confiabilidade}
                    </span>
                  </div>
                </div>

                {resultado.totalDenuncias > 0 && (
                  <div className="alerta-info">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p>
                      Este contato possui denúncias registradas. Tenha cautela ao interagir e verifique 
                      a autenticidade antes de fornecer dados pessoais ou realizar transações.
                    </p>
                  </div>
                )}

                {resultado.totalDenuncias === 0 && (
                  <div className="sucesso-info">
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <p>
                      Não encontramos denúncias para este contato. Mesmo assim, mantenha sempre 
                      atenção e cuidado com seus dados pessoais.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <ErrorModal
        isOpen={modalErroAberto}
        onClose={() => setModalErroAberto(false)}
        message={erro}
        title="Erro na Verificação"
      />
    </div>
  );
}

export default VerificarContato;
