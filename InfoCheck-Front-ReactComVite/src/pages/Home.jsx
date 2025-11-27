// src/pages/Home.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../api";
import "../styles/Home.css";

function Home() {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [usuario, setUsuario] = useState(null);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [sugestoes, setSugestoes] = useState([]);
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [erro, setErro] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("usuarioLogado");
    if (stored) {
      setUsuarioLogado(JSON.parse(stored));
      const parsed = JSON.parse(stored);
      setUsuario(parsed);
    }
  }, []);

  // Buscar sugestões de bancos enquanto o usuário digita
  useEffect(() => {
    const buscarSugestoes = async () => {
      if (busca.trim().length < 2) {
        setSugestoes([]);
        setMostrarSugestoes(false);
        return;
      }

      try {
        const bancos = await apiGet(`/api/bancos/autocomplete?termo=${encodeURIComponent(busca)}`);
        setSugestoes(bancos || []);
        setMostrarSugestoes(true);
      } catch (error) {
        console.error("Erro ao buscar sugestões:", error);
        setSugestoes([]);
      }
    };

    const timeoutId = setTimeout(buscarSugestoes, 300);
    return () => clearTimeout(timeoutId);
  }, [busca]);

  const handleBusca = async (e) => {
    e.preventDefault();
    setErro("");

    const termo = busca.trim();
    if (!termo) {
      setErro("Digite o nome de um banco para buscar");
      return;
    }

    try {
      // Usa autocomplete para evitar 404 quando nao existir nome exato
      const bancos = await apiGet(`/api/bancos/autocomplete?termo=${encodeURIComponent(termo)}`);

      if (bancos && bancos.length > 0) {
        const matchExato = bancos.find(
          (b) => b.nome_banco.toLowerCase() === termo.toLowerCase()
        );
        const destino = matchExato || bancos[0];
        navigate(`/golpes-por-banco/${destino.id_banco}`);
      } else {
        setErro("Banco nao encontrado. Verifique o nome e tente novamente.");
      }
    } catch (error) {
      console.error("Erro ao buscar banco:", error);
      setErro("Banco nao encontrado. Verifique o nome e tente novamente.");
    }
  };

  const selecionarSugestao = (banco) => {
    setBusca(banco.nome_banco);
    setMostrarSugestoes(false);
    navigate(`/golpes-por-banco/${banco.id_banco}`);
  };

  return (
    <div className="home-container">
      {/* Header com busca e botões */}
      <header className="home-header">
        <div className="header-content">
          <h1 className="logo">
            <svg className="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            InfoCheck
            <svg className="logo-check" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </h1>

          <form onSubmit={handleBusca} className="search-bar-header">
            <div className="search-wrapper">
              <input
                type="text"
                placeholder="Digite aqui o nome do banco ou um número suspeito..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                onFocus={() => sugestoes.length > 0 && setMostrarSugestoes(true)}
                onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)}
              />
              <button type="submit">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
                  <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>

              {/* Sugestões de autocomplete */}
              {mostrarSugestoes && sugestoes.length > 0 && (
                <div className="sugestoes-dropdown">
                  {sugestoes.map((banco) => (
                    <div
                      key={banco.id_banco}
                      className="sugestao-item"
                      onClick={() => selecionarSugestao(banco)}
                    >
                      <div className="banco-logo-mini">{banco.nome_banco.charAt(0)}</div>
                      <span>{banco.nome_banco}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mensagem de erro */}
            {erro && (
              <div className="erro-busca">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2"/>
                  <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                {erro}
              </div>
            )}
          </form>

          <div className="header-actions">
            {!usuarioLogado && (
              <button className="btn-entrar" onClick={() => navigate("/login")}>
                Entrar
              </button>
            )}
            {usuarioLogado && (
              <>
                <button className="btn-user" onClick={() => navigate("/dashboard")}>
                  <svg viewBox="0 0 24 24" fill="none">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"
                      stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="7" r="4"
                      stroke="currentColor" strokeWidth="2" />
                  </svg>
                </button>
                <span style={{color: "white"}}>
                  {usuario.nome}
                </span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Banner principal */}
      <section className="hero-section">
        <div className="hero-content">
          <h2>Sofreu um golpe e precisa de ajuda?</h2>
          <p>
            O Brasil registra aproximadamente 4.678 tentativas de golpes financeiros por hora.
            Isso totaliza cerca de 112.272 tentativas por dia.
          </p>
          <p className="hero-subtitle">
            Verifique se um contato é confiável antes de interagir.
          </p>
          <div className="hero-buttons">
            <button className="btn-verificar-principal" onClick={() => navigate("/verificar-contato")}>
              <svg viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2"/>
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Verificar Contato
            </button>
            {usuarioLogado && (
              <button className="btn-denunciar-secundario" onClick={() => navigate("/denuncia-elaborada")}>
                Denunciar
              </button>
            )}
            {!usuarioLogado && (
              <button className="btn-denunciar-secundario" onClick={() => navigate("/login")}>
                Denunciar
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Cards de navegação */}
      <section className="cards-section">
        <div className="cards-container">
          <div className="info-card" onClick={() => navigate("/golpes-por-banco")}>
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <polyline points="14 2 14 8 20 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3>Contatos Oficiais dos Bancos</h3>
            <p>Veja os canais oficiais de atendimento</p>
          </div>

          <div
            className="info-card"
            onClick={() => navigate(usuarioLogado ? "/denuncia-elaborada" : "/login")}
          >
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 11l3 3L22 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3>Registro de Golpes</h3>
            <p>Registre e consulte denúncias</p>
          </div>

          <div className="info-card" onClick={() => navigate("/feed-alertas")}>
            <div className="card-icon">
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <h3>Feed de Alertas</h3>
            <p>Últimas notícias sobre golpes</p>
          </div>
        </div>
      </section>

      {/* Rodapé */}
      <footer className="home-footer">
        <p>© 2024 InfoCheck - Central de Denúncias de Golpes Financeiros</p>
        <div className="footer-links">
          <button onClick={() => navigate("/estatisticas")}>Estatísticas</button>
          <span>•</span>
          <button onClick={() => navigate("/sobre")}>Sobre</button>
          <span>•</span>
          <button onClick={() => navigate("/ajuda")}>Ajuda</button>
        </div>
      </footer>
    </div>
  );
}

export default Home;
