// src/pages/GolpesPorBanco.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet } from "../api";
import "../styles/GolpesPorBanco.css";

function GolpesPorBanco() {
  const navigate = useNavigate();
  const { idBanco } = useParams();

  const [bancoSelecionado, setBancoSelecionado] = useState(null);
  const [bancos, setBancos] = useState([]);
  const [contatosOficiais, setContatosOficiais] = useState([]);
  const [golpes, setGolpes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [usuario, setUsuario] = useState(null);
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem("usuarioLogado");
    if (stored) {
      setUsuarioLogado(JSON.parse(stored));
      const parsed = JSON.parse(stored);
      setUsuario(parsed);
    }
  }, []);

  useEffect(() => {
    carregarBancos();
  }, []);

  useEffect(() => {
    if (idBanco && bancos.length > 0) {
      const banco = bancos.find((b) => b.id_banco === parseInt(idBanco, 10));
      if (banco) {
        setBancoSelecionado(banco);
        carregarDadosDoBanco(banco.id_banco);
      }
    }
  }, [idBanco, bancos]);

  async function carregarBancos() {
    try {
      const dados = await apiGet("/api/bancos");
      setBancos(dados || []);

      if (!idBanco && dados && dados.length > 0) {
        setBancoSelecionado(dados[0]);
        carregarDadosDoBanco(dados[0].id_banco);
      }
    } catch (err) {
      console.error("Erro ao carregar bancos:", err);
    } finally {
      setLoading(false);
    }
  }

  async function carregarDadosDoBanco(idBancoSelecionado) {
    setLoading(true);
    try {
      // Carregar contatos oficiais do banco
      const contatos = await apiGet(`/api/bancos/${idBancoSelecionado}/contatos`);
      setContatosOficiais(contatos || []);

      // Carregar denúncias/golpes do banco
      const denuncias = await apiGet(`/api/denuncias/banco/${idBancoSelecionado}`);
      setGolpes(denuncias || []);
    } catch (err) {
      console.error("Erro ao carregar dados do banco:", err);
      setContatosOficiais([]);
      setGolpes([]);
    } finally {
      setLoading(false);
    }
  }

  function selecionarBanco(banco) {
    setBancoSelecionado(banco);
    navigate(`/golpes-por-banco/${banco.id_banco}`);
  }

  // Mapear ícones para tipos de contato
  const getIconeContato = (tipo) => {
    const icones = {
      'SAC': '☎',
      'Ouvidoria': '📢',
      'WhatsApp': '💬',
      'Site': '🌐',
      'Email': '📧',
      'Telefone': '📞'
    };
    return icones[tipo] || '📋';
  };

  // Gerar cor para o banco baseada no ID
  const getCorBanco = (idBanco) => {
    const cores = [
      '#0f172a', '#c00418', '#ff6200', '#c30d23', 
      '#0d7d3d', '#820ad1', '#ff8800', '#1e40af'
    ];
    return cores[idBanco % cores.length];
  };

  return (
    <div className="golpes-banco-container">
      <header className="golpes-header">
        <div className="header-content">
          <h1 className="logo" onClick={() => navigate("/")}>
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

      <div className="golpes-content">
        <aside className="bancos-sidebar">
          <h3>Bancos relacionados:</h3>
          <div className="bancos-list">
            {bancos.map((banco) => (
              <button
                key={banco.id_banco}
                className={`banco-item ${bancoSelecionado?.id_banco === banco.id_banco ? "active" : ""}`}
                onClick={() => selecionarBanco(banco)}
              >
                <div 
                  className="banco-logo"
                  style={{ backgroundColor: getCorBanco(banco.id_banco) }}
                >
                  {banco.nome_banco.charAt(0).toUpperCase()}
                </div>
                <span>{banco.nome_banco}</span>
              </button>
            ))}
          </div>
        </aside>

        <main className="banco-main">
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Carregando...</p>
            </div>
          ) : bancoSelecionado ? (
            <>
              <div className="banco-header">
                <div 
                  className="banco-logo-grande" 
                  style={{ backgroundColor: getCorBanco(bancoSelecionado.id_banco) }}
                >
                  {bancoSelecionado.nome_banco.charAt(0).toUpperCase()}
                  {bancoSelecionado.nome_banco.split(' ')[1]?.charAt(0).toUpperCase() || ''}
                </div>
                <div className="banco-info">
                  <h2>{bancoSelecionado.nome_banco}</h2>
                  <p className="banco-descricao">
                    {bancoSelecionado.descricao || 
                      `Veja os últimos golpes reportados envolvendo o ${bancoSelecionado.nome_banco}`}
                  </p>
                </div>
              </div>

              <div className="denuncia-box">
                <h3>Deseja registrar um golpe sobre o {bancoSelecionado.nome_banco}?</h3>
                <button 
                  className="btn-registrar-golpe" 
                  onClick={() => navigate(usuarioLogado ? "/denuncia-elaborada" : "/login")}
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  Registre agora!
                </button>
              </div>

              <section className="golpes-section">
                <h3>Últimos golpes informados</h3>

                {golpes.length === 0 ? (
                  <div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <path d="M12 8v4M12 16h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    <p>Nenhum golpe reportado ainda para este banco</p>
                  </div>
                ) : (
                  <div className="golpes-list">
                    {golpes.map((golpe) => (
                      <article key={golpe.id_denuncia} className="golpe-card">
                        <div className="golpe-header">
                          <div className="usuario-avatar">
                            {golpe.usuario?.nome?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="golpe-meta">
                            <strong>{golpe.usuario?.nome || 'Usuário Anônimo'}</strong>
                            <span className="golpe-tipo">
                              {golpe.tipoGolpe?.nome_tipo || golpe.tipoGolpeOutro || 'Tipo não especificado'}
                            </span>
                          </div>
                        </div>

                        <p className="golpe-descricao">
                          {golpe.descricao && golpe.descricao.length > 200 
                            ? golpe.descricao.substring(0, 200) + "..." 
                            : golpe.descricao || 'Sem descrição'}
                        </p>

                        {golpe.contatoDenunciado && (
                          <div className="golpe-contato">
                            <strong>Contato suspeito:</strong> {golpe.contatoDenunciado}
                          </div>
                        )}

                        {golpe.valor && (
                          <div className="golpe-valor">
                            <strong>Valor:</strong> R$ {golpe.valor.toFixed(2)}
                          </div>
                        )}

                        <div className="golpe-footer">
                          <span className="golpe-data">
                            {golpe.data_denuncia 
                              ? new Date(golpe.data_denuncia).toLocaleDateString("pt-BR")
                              : 'Data não informada'}
                          </span>
                        </div>
                      </article>
                    ))}
                  </div>
                )}
              </section>

              <aside className="banco-sobre">
                <h3>Sobre o {bancoSelecionado.nome_banco}</h3>
                <p>
                  {bancoSelecionado.descricao ||
                    `O ${bancoSelecionado.nome_banco} é uma instituição financeira com milhões de clientes no Brasil. Fique atento a golpes que utilizam o nome do banco.`}
                </p>

                <div className="contato-oficial">
                  <h4>Contatos Oficiais</h4>
                  
                  {contatosOficiais.length === 0 ? (
                    <p className="sem-contatos">
                      Nenhum contato oficial cadastrado para este banco.
                    </p>
                  ) : (
                    <div className="canais-lista">
                      {contatosOficiais.map((contato, idx) => (
                        <div key={`${contato.id_contato}-${idx}`} className="canal-card">
                          <div 
                            className="canal-icone" 
                            style={{ backgroundColor: getCorBanco(bancoSelecionado.id_banco) }}
                          >
                            {getIconeContato(contato.tipo_contato)}
                          </div>
                          <div>
                            <p className="canal-tipo">{contato.tipo_contato}</p>
                            <p className="canal-valor">{contato.valor_contato}</p>
                            {contato.observacao && (
                              <p className="canal-detalhe">{contato.observacao}</p>
                            )}
                            {contato.verificado && (
                              <span className="canal-verificado">✓ Verificado</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {bancoSelecionado.site_oficial && (
                  <div className="site-oficial">
                    <strong>Site Oficial:</strong>
                    <a href={bancoSelecionado.site_oficial} target="_blank" rel="noopener noreferrer">
                      {bancoSelecionado.site_oficial}
                    </a>
                  </div>
                )}
              </aside>
            </>
          ) : (
            <div className="empty-state">
              <p>Selecione um banco para ver os golpes reportados</p>
            </div>
          )}
        </main>

        <aside className="cadastroBanco-sidebar">
          <h3>Cadastre uma instituição financeira</h3>
          <p>
            Registre a instituição financeira para aparecer nos canais oficiais e no monitoramento de golpes. Isso reforça a confiabilidade e permite que usuarios consultem e denunciem contatos suspeitos ligados a ela.
          </p>
          <button className="btn-entrar empresa" onClick={() => navigate("/cadastroempresa")}>
            Cadastrar instituição
          </button>
        </aside>
      </div>
    </div>
  );
}

export default GolpesPorBanco;
