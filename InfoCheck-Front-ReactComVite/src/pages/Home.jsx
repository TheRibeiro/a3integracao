// src/pages/Home.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  ShieldCheck, 
  Search, 
  User, 
  AlertTriangle, 
  FileText, 
  Phone, 
  ArrowRight,
  Activity,
  Lock
} from "lucide-react";
import { apiGet } from "../api";
import "../styles/HomeModern.css";

// Componente para animar números
const CountUp = ({ end, duration = 2 }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = end / (duration * 60);
    const timer = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 1000 / 60);
    return () => clearInterval(timer);
  }, [end, duration]);

  return <span>{count.toLocaleString('pt-BR')}</span>;
};

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
      setUsuario(JSON.parse(stored));
    }
  }, []);

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
      const bancos = await apiGet(`/api/bancos/autocomplete?termo=${encodeURIComponent(termo)}`);
      if (bancos && bancos.length > 0) {
        const matchExato = bancos.find(b => b.nome_banco.toLowerCase() === termo.toLowerCase());
        const destino = matchExato || bancos[0];
        navigate(`/golpes-por-banco/${destino.id_banco}`);
      } else {
        setErro("Banco não encontrado.");
      }
    } catch (error) {
      setErro("Erro ao buscar banco.");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <div className="home-container">
      <div className="background-glow" />
      <div className="background-glow-2" />

      <header className="home-header">
        <div className="logo">
          <ShieldCheck className="logo-icon" size={32} />
          InfoCheck
        </div>

        <form onSubmit={handleBusca} className="search-wrapper">
          <input
            type="text"
            className="search-input"
            placeholder="Buscar banco ou número suspeito..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            onFocus={() => sugestoes.length > 0 && setMostrarSugestoes(true)}
            onBlur={() => setTimeout(() => setMostrarSugestoes(false), 200)}
          />
          <button type="submit" className="search-btn">
            <Search size={20} />
          </button>
          
          {mostrarSugestoes && sugestoes.length > 0 && (
            <div className="sugestoes-dropdown" style={{
              position: 'absolute', top: '110%', left: 0, right: 0, 
              background: '#1e293b', borderRadius: '12px', padding: '0.5rem',
              border: '1px solid rgba(255,255,255,0.1)', zIndex: 100
            }}>
              {sugestoes.map((banco) => (
                <div
                  key={banco.id_banco}
                  onClick={() => {
                    setBusca(banco.nome_banco);
                    setMostrarSugestoes(false);
                    navigate(`/golpes-por-banco/${banco.id_banco}`);
                  }}
                  style={{
                    padding: '0.75rem', cursor: 'pointer', color: 'white',
                    borderRadius: '8px', transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'rgba(255,255,255,0.1)'}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  {banco.nome_banco}
                </div>
              ))}
            </div>
          )}
        </form>

        <div className="header-actions">
          {usuarioLogado ? (
            <button className="btn-secondary" onClick={() => navigate("/dashboard")}>
              <User size={18} style={{marginRight: '8px', display: 'inline'}} />
              {usuario.nome.split(' ')[0]}
            </button>
          ) : (
            <button className="btn-primary" onClick={() => navigate("/login")}>
              Entrar <ArrowRight size={18} />
            </button>
          )}
        </div>
      </header>

      <motion.section 
        className="hero-section"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <motion.h2 className="hero-title" variants={itemVariants}>
          Segurança Financeira <br />
          <span className="hero-highlight">Inteligente e Rápida</span>
        </motion.h2>
        
        <motion.p className="hero-subtitle" variants={itemVariants}>
          Proteja-se contra fraudes bancárias com nossa base de dados atualizada em tempo real.
          Verifique contatos, denuncie golpes e mantenha seu patrimônio seguro.
        </motion.p>

        <motion.div className="hero-stats" variants={itemVariants}>
          <div className="stat-item">
            <span className="stat-number text-green-400">
              <CountUp end={4678} />
            </span>
            <span className="stat-label">Tentativas/Hora</span>
          </div>
          <div className="stat-item">
            <span className="stat-number text-blue-400">
              <CountUp end={112272} />
            </span>
            <span className="stat-label">Tentativas/Dia</span>
          </div>
          <div className="stat-item">
            <span className="stat-number text-purple-400">
              <CountUp end={98} />%
            </span>
            <span className="stat-label">Precisão</span>
          </div>
        </motion.div>

        <motion.div className="hero-buttons" variants={itemVariants}>
          <button className="btn-primary" onClick={() => navigate("/verificar-contato")}>
            <ShieldCheck size={20} /> Verificar Contato
          </button>
          <button className="btn-secondary" onClick={() => navigate(usuarioLogado ? "/denuncia-elaborada" : "/login")}>
            <AlertTriangle size={20} style={{marginRight: '8px'}}/> Denunciar Golpe
          </button>
        </motion.div>
      </motion.section>

      <section className="cards-grid">
        <motion.div 
          className="feature-card"
          whileHover={{ y: -10 }}
          onClick={() => navigate("/golpes-por-banco")}
        >
          <div className="card-icon-wrapper">
            <Phone size={32} />
          </div>
          <h3>Canais Oficiais</h3>
          <p>Acesse rapidamente os contatos verificados de todos os bancos e evite fraudes.</p>
        </motion.div>

        <motion.div 
          className="feature-card"
          whileHover={{ y: -10 }}
          onClick={() => navigate(usuarioLogado ? "/denuncia-elaborada" : "/login")}
        >
          <div className="card-icon-wrapper">
            <FileText size={32} />
          </div>
          <h3>Registrar Denúncia</h3>
          <p>Contribua com a comunidade reportando números e contas suspeitas.</p>
        </motion.div>

        <motion.div 
          className="feature-card"
          whileHover={{ y: -10 }}
          onClick={() => navigate("/feed-alertas")}
        >
          <div className="card-icon-wrapper">
            <Activity size={32} />
          </div>
          <h3>Feed de Alertas</h3>
          <p>Fique por dentro dos golpes mais recentes e proteja-se preventivamente.</p>
        </motion.div>

        <motion.div 
          className="feature-card"
          whileHover={{ y: -10 }}
          onClick={() => navigate("/estatisticas")}
        >
          <div className="card-icon-wrapper">
            <Lock size={32} />
          </div>
          <h3>Estatísticas</h3>
          <p>Visualize dados em tempo real sobre a segurança bancária no Brasil.</p>
        </motion.div>
      </section>

      <footer className="home-footer">
        <p>© 2024 InfoCheck • Protegendo seu patrimônio</p>
      </footer>
    </div>
  );
}

export default Home;
