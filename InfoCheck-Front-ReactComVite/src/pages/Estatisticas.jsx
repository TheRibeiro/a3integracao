// src/pages/Estatisticas.jsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../api";
import "../styles/Estatisticas.css";

function Estatisticas() {
  const navigate = useNavigate();
  const [denuncias, setDenuncias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        const data = await apiGet("/api/denuncias");
        setDenuncias(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Erro ao carregar estatisticas:", err);
        setDenuncias([]);
      } finally {
        setLoading(false);
      }
    };
    carregar();
  }, []);

  const stats = useMemo(() => {
    const totalDenuncias = denuncias.length;

    const hoje = new Date().toISOString().split("T")[0];
    const denunciasHoje = denuncias.filter((d) =>
      d.data_denuncia ? d.data_denuncia.startsWith(hoje) : false
    ).length;

    const porBanco = new Map();
    const porTipo = new Map();
    const porMes = Array(12).fill(0);

    denuncias.forEach((d) => {
      const bancoNome = d.banco?.nome_banco || d.nomeBancoOutro || "Não informado";
      porBanco.set(bancoNome, (porBanco.get(bancoNome) || 0) + 1);

      const tipoNome = d.tipoGolpe?.nome_tipo || d.tipoGolpeOutro || "Não informado";
      porTipo.set(tipoNome, (porTipo.get(tipoNome) || 0) + 1);

      if (d.data_denuncia) {
        const data = new Date(d.data_denuncia);
        if (!Number.isNaN(data.getTime())) {
          porMes[data.getMonth()] += 1;
        }
      }
    });

    const bancoMaisDenunciado =
      [...porBanco.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";
    const tipoMaisComum =
      [...porTipo.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    const topBancos = [...porBanco.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5);

    const tiposDistrib = [...porTipo.entries()].sort((a, b) => b[1] - a[1]);

    return {
      totalDenuncias,
      denunciasHoje,
      bancoMaisDenunciado,
      tipoMaisComum,
      porMes,
      topBancos,
      tiposDistrib,
    };
  }, [denuncias]);

  return (
    <div className="estatisticas-container">
      <header className="estat-header">
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
          <button className="btn-voltar" onClick={() => navigate("/")}>
            ← Voltar
          </button>
        </div>
      </header>

      <main className="estat-main">
        <h2>Estatísticas de Golpes</h2>

        {loading && (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Carregando estatísticas...</p>
          </div>
        )}
        
        {!loading && (
        <>
          <div className="stats-cards">
            <div className="stat-card blue">
              <div className="stat-icon">Σ</div>
              <div className="stat-info">
                <h3>{stats.totalDenuncias.toLocaleString()}</h3>
                <p>Total de Denúncias</p>
              </div>
            </div>

            <div className="stat-card green">
              <div className="stat-icon">✓</div>
              <div className="stat-info">
                <h3>{stats.denunciasHoje}</h3>
                <p>Denúncias Hoje</p>
              </div>
            </div>

            <div className="stat-card purple">
              <div className="stat-icon">★</div>
              <div className="stat-info">
                <h3>{stats.bancoMaisDenunciado}</h3>
                <p>Banco Mais Denunciado</p>
              </div>
            </div>

            <div className="stat-card red">
              <div className="stat-icon">!</div>
              <div className="stat-info">
                <h3>{stats.tipoMaisComum}</h3>
                <p>Tipo Mais Comum</p>
              </div>
            </div>
          </div>

          <div className="charts-grid">
            <div className="chart-card">
              <h3>Denúncias por Mês</h3>
              <div className="simple-chart">
                {stats.porMes.map((valor, idx) => {
                  const max = Math.max(...stats.porMes, 1);
                  const percent = Math.max(5, Math.min(100, (valor / max) * 100));
                  const labels = ["Jan","Fev","Mar","Abr","Mai","Jun","Jul","Ago","Set","Out","Nov","Dez"];
                  return (
                    <div key={idx} className="bar" style={{height: `${percent}%`}}>
                      <span>{labels[idx]}</span>
                      <small>{valor}</small>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="chart-card">
              <h3>Top 5 Bancos Denunciados</h3>
              <div className="ranking-list">
                {stats.topBancos.length === 0 && <p>Sem dados de bancos.</p>}
                {stats.topBancos.map(([nome, qtd], idx) => {
                  const max = stats.topBancos[0] ? stats.topBancos[0][1] : 1;
                  const perc = Math.max(5, (qtd / max) * 100);
                  return (
                    <div className="ranking-item" key={nome}>
                      <span className="rank">{idx + 1}º</span>
                      <span className="name">{nome}</span>
                      <div className="progress-bar"><div style={{width: `${perc}%`}}></div></div>
                      <span className="value">{qtd}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="chart-card">
              <h3>Tipos de Golpes</h3>
              <div className="donut-chart">
                {stats.tiposDistrib.length === 0 && <p>Sem dados de tipos de golpe.</p>}
                {stats.tiposDistrib.map(([nome, qtd], idx) => {
                  const cores = ["#3b82f6","#8b5cf6","#ef4444","#f59e0b","#10b981","#0ea5e9","#a855f7"];
                  const perc = stats.totalDenuncias ? ((qtd / stats.totalDenuncias) * 100).toFixed(1) : "0";
                  return (
                    <div key={nome} className="donut-item" style={{background: cores[idx % cores.length]}}>
                      <span>{nome}</span>
                      <strong>{perc}%</strong>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
        )}
      </main>
    </div>
  );
}

export default Estatisticas;
