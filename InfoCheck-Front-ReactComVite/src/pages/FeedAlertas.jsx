// src/pages/FeedAlertas.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { API_BASE_URL } from "../api";
import "../styles/FeedAlertas.css";

// Configuração da URL base da API
const API_URL = `${API_BASE_URL}/api`;

function FeedAlertas() {
  const navigate = useNavigate();
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState(null);
  const [atualizando, setAtualizando] = useState(false);

  /**
   * Função para buscar notícias da API
   */
  const buscarNoticias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_URL}/noticias`);
      
      if (response.data && response.data.length > 0) {
        setAlertas(response.data);
        setUltimaAtualizacao(new Date());
      } else {
        // Se não houver notícias, tenta forçar atualização
        await forcarAtualizacao();
      }
    } catch (err) {
      console.error("Erro ao buscar notícias:", err);
      setError("Erro ao carregar notícias. Tentando novamente...");
      
      // Em caso de erro, adiciona notícias de exemplo
      setAlertas([
        {
          id: 1,
          titulo: "Novo golpe usa números muito parecidos com os de bancos oficiais",
          descricao: "Criminosos estão utilizando números quase idênticos aos de centrais de atendimento para enganar clientes. Especialistas alertam para sempre verificar o contato antes de responder.",
          urlImagem: null,
          categoria: "Phishing",
          dataPublicacao: new Date().toISOString(),
          tags: ["Telefone", "Bancos", "Alerta Máximo"],
          fonte: "InfoCheck"
        }
      ]);
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Função para forçar atualização de notícias no backend
   */
  const forcarAtualizacao = async () => {
    try {
      setAtualizando(true);
      await axios.post(`${API_URL}/noticias/atualizar`);
      
      // Aguarda 2 segundos para dar tempo do backend buscar notícias
      setTimeout(async () => {
        await buscarNoticias();
        setAtualizando(false);
      }, 2000);
    } catch (err) {
      console.error("Erro ao forçar atualização:", err);
      setAtualizando(false);
    }
  };

  /**
   * Effect para buscar notícias ao montar o componente
   */
  useEffect(() => {
    buscarNoticias();
  }, [buscarNoticias]);

  /**
   * Effect para implementar polling (atualização automática a cada 5 minutos)
   */
  useEffect(() => {
    // Configura intervalo de 5 minutos (300000ms)
    const intervalo = setInterval(() => {
      console.log("Atualizando notícias automaticamente...");
      buscarNoticias();
    }, 300000); // 5 minutos

    // Limpa o intervalo quando o componente for desmontado
    return () => clearInterval(intervalo);
  }, [buscarNoticias]);

  /**
   * Formata a data para exibição
   */
  const formatarData = (dataString) => {
    if (!dataString) return "Data não disponível";
    
    try {
      const data = new Date(dataString);
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return "Data não disponível";
    }
  };

  /**
   * Formata tempo decorrido desde a última atualização
   */
  const formatarTempoDecorrido = () => {
    if (!ultimaAtualizacao) return "Nunca";
    
    const agora = new Date();
    const diff = Math.floor((agora - ultimaAtualizacao) / 1000); // diferença em segundos
    
    if (diff < 60) return `${diff}s atrás`;
    if (diff < 3600) return `${Math.floor(diff / 60)}min atrás`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h atrás`;
    return `${Math.floor(diff / 86400)}d atrás`;
  };

  return (
    <div className="feed-container">
      {/* Header */}
      <header className="feed-header">
        <div className="header-content">
          <h1 className="logo" onClick={() => navigate("/")}>
            <svg className="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            InfoCheck
            <svg className="logo-check" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </h1>

          <div className="search-bar-header">
            <input
              type="text"
              placeholder="Digite aqui o nome do banco ou um número suspeito..."
            />
            <button type="button">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </button>
          </div>

          <div className="header-actions">
            <button className="btn-icon" onClick={() => buscarNoticias()} disabled={atualizando} title="Atualizar notícias">
              <svg 
                viewBox="0 0 24 24" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className={atualizando ? "rotating" : ""}
              >
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"/>
              </svg>
            </button>
            <button className="btn-user">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="feed-main">
        <div className="feed-content">
          <div className="feed-header-info">
            <h2 className="feed-title">Feed de Alertas</h2>
            <div className="feed-status">
              {atualizando && (
                <span className="status-atualizando">
                  <svg className="spinner" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" />
                  </svg>
                  Atualizando...
                </span>
              )}
              {ultimaAtualizacao && !atualizando && (
                <span className="status-info">
                  Atualizado {formatarTempoDecorrido()}
                </span>
              )}
            </div>
          </div>

          {error && (
            <div className="error-banner">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              {error}
            </div>
          )}

          {loading && alertas.length === 0 ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Carregando notícias sobre golpes...</p>
            </div>
          ) : (
            <div className="alertas-grid">
              {alertas.length === 0 ? (
                <div className="no-alertas">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                    <path d="M12 16v-4M12 8h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                  <p>Nenhuma notícia disponível no momento.</p>
                  <button onClick={forcarAtualizacao} className="btn-atualizar">
                    Buscar Notícias
                  </button>
                </div>
              ) : (
                alertas.map(alerta => (
                  <article key={alerta.id} className="alerta-card">
                    {/* Imagem/Ícone */}
                    <div className="alerta-image">
                      {alerta.urlImagem ? (
                        <img src={alerta.urlImagem} alt={alerta.titulo} />
                      ) : (
                        <div className="alerta-icon">
                          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M10.29 3.86L1.82 18C1.64537 18.3024 1.55296 18.6453 1.55199 18.9945C1.55101 19.3437 1.64151 19.6871 1.81445 19.9905C1.98738 20.2939 2.23675 20.5467 2.53773 20.7239C2.83871 20.9011 3.18082 20.9962 3.53 21H20.47C20.8192 20.9962 21.1613 20.9011 21.4623 20.7239C21.7633 20.5467 22.0126 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Conteúdo */}
                    <div className="alerta-content">
                      <div className="alerta-header-info">
                        <span className="alerta-categoria">{alerta.categoria || "Alerta"}</span>
                        <span className="alerta-data">
                          {formatarData(alerta.dataPublicacao)}
                        </span>
                      </div>

                      <h3 className="alerta-titulo">{alerta.titulo}</h3>
                      <p className="alerta-descricao">{alerta.descricao}</p>

                      {alerta.fonte && (
                        <div className="alerta-fonte">
                          Fonte: {alerta.fonte}
                        </div>
                      )}

                      <div className="alerta-tags">
                        {Array.isArray(alerta.tags) ? (
                          alerta.tags.map((tag, index) => (
                            <span key={index} className="tag">{tag}</span>
                          ))
                        ) : (
                          alerta.tags && alerta.tags.split(',').map((tag, index) => (
                            <span key={index} className="tag">{tag.trim()}</span>
                          ))
                        )}
                      </div>

                      {alerta.urlNoticia && (
                        <a 
                          href={alerta.urlNoticia} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="btn-leia-mais"
                        >
                          Leia mais →
                        </a>
                      )}
                    </div>
                  </article>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default FeedAlertas;
