// src/pages/Dashboard.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet, apiPost } from "../api";
import "../styles/Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState(null);
  const [abaAtiva, setAbaAtiva] = useState("historicoDenuncia");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha, setMostrarConfirmarSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const [denuncias, setDenuncias] = useState([]);

  function formatarCEP(valor) {
    // Remove tudo que não for número
    const numeros = valor.replace(/\D/g, "");

    // Limita a 8 dígitos
    const limitados = numeros.substring(0, 8);

    // Aplica o traço após os 5 primeiros dígitos
    if (limitados.length > 5) {
      return `${limitados.substring(0, 5)}-${limitados.substring(5)}`;
    } else {
      return limitados;
    }
  }

  function formatarCPF(valor) {
    const numeros = valor.replace(/\D/g, "");
    const parte1 = numeros.slice(0, 3);
    const parte2 = numeros.slice(3, 6);
    const parte3 = numeros.slice(6, 9);
    const parte4 = numeros.slice(9, 11);

    let resultado = parte1;
    if (parte2) resultado += `.${parte2}`;
    if (parte3) resultado += `.${parte3}`;
    if (parte4) resultado += `-${parte4}`;

    return resultado;
  }

  // Estado do formulário de usuário
  const [formUsuario, setFormUsuario] = useState({
    nome: "",
    dataNascimento: "",
    cep: "",
    senha: "",
    confirmarSenha: ""
  });

  useEffect(() => {
    const stored = localStorage.getItem("usuarioLogado");

    if (!stored) {
      navigate("/login");
      return;
    }

    try {
      const parsed = JSON.parse(stored);
      setUsuario(parsed);

      setFormUsuario({
        nome: parsed.nome || "",
        dataNascimento: parsed.dataNascimento || "",
        cep: parsed.cep ? formatarCEP(parsed.cep) : "",
        senha: "",
        confirmarSenha: ""
      });

      async function carregarDenuncias() {
        try {
          setLoading(true);
          const resposta = await apiGet(`/api/denuncias/usuarios/${parsed.id_usuario}/denuncias`);
          setDenuncias(resposta);
        } catch (e) {
          console.error("Erro ao carregar denúncias:", e);
        } finally {
          setLoading(false);
        }
      }


      carregarDenuncias();

    } catch (e) {
      console.error("Erro ao ler usuário:", e);
      localStorage.removeItem("usuarioLogado");
      navigate("/login");
    }

  }, [navigate]);


  function handleLogout() {
    localStorage.removeItem("usuarioLogado");
    navigate("/login");
  }

  async function salvarAlteracoes() {
    setLoading(true); // começa a carregar
    // Validação de senha
    if (formUsuario.senha !== formUsuario.confirmarSenha) {
      alert("As senhas não coincidem!");
      setLoading(false);
      return;
    }

    if (formUsuario.senha.length > 0 && formUsuario.senha.length < 6) {
      alert("A senha deve ter pelo menos 6 caracteres!");
      setLoading(false);
      return;
    }

    try {
      const dados = {
        idUsuario: usuario.id_usuario,
        nome: formUsuario.nome,
        dataNascimento: formUsuario.dataNascimento,
        cep: formUsuario.cep.replace(/\D/g, ""),
        senha: formUsuario.senha
      };

      await apiPost("/api/usuarios/atualizar", dados);

      alert("Dados atualizados com sucesso!");

      // Atualiza localStorage e estado
      const atualizado = { ...usuario, ...dados };
      localStorage.setItem("usuarioLogado", JSON.stringify(atualizado));
      setUsuario(atualizado);

      // Limpa campos de senha
      setFormUsuario({ ...formUsuario, senha: "", confirmarSenha: "" });
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Erro ao salvar alterações. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (!usuario) return null;

  const bancos = {
    "1": "Bradesco",
    "2": "Itaú",
    "3": "Santander",
  };

  const golpes = {
    "1": "Phishing",
    "2": "Golpe do WhatsApp",
    "3": "Falso Boleto",
    "4": "Clonagem de Cartão",
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-logo">
            <svg className="logo-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span onClick={() => navigate("/")} style={{ cursor: "pointer" }}>InfoCheck</span>
            <svg className="logo-check" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 6L9 17L4 12" stroke="#10b981" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <div className="header-user">
            <div className="user-info">
              <div className="user-avatar">
                {usuario.nome.charAt(0).toUpperCase()}
              </div>
              <div className="user-details">
                <span className="user-name">{usuario.nome}</span>
                <span className="user-cpf">{formatarCPF(usuario.cpf)}</span>
              </div>
            </div>
            <button className="logout-button" onClick={handleLogout}>
              <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M16 17L21 12L16 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Sair
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-content">
        {/* Sidebar de navegação */}
        <nav className="dashboard-sidebar">
          <button
            className={`nav-item ${abaAtiva === "historicoDenuncia" ? "active" : ""}`}
            onClick={() => setAbaAtiva("historicoDenuncia")}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21L16.65 16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>Histórico de denúncia</span>
          </button>

          <button
            className={`nav-item ${abaAtiva === "alterarDados" ? "active" : ""}`}
            onClick={() => setAbaAtiva("alterarDados")}
          >
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10.29 3.86L1.82 18C1.64537 18.3024 1.55296 18.6453 1.55199 18.9945C1.55101 19.3437 1.64151 19.6871 1.81445 19.9905C1.98738 20.2939 2.23675 20.5467 2.53773 20.7239C2.83871 20.9011 3.18082 20.9962 3.53 21H20.47C20.8192 20.9962 21.1613 20.9011 21.4623 20.7239C21.7633 20.5467 22.0126 20.2939 22.1856 19.9905C22.3585 19.6871 22.449 19.3437 22.448 18.9945C22.447 18.6453 22.3546 18.3024 22.18 18L13.71 3.86C13.5317 3.56611 13.2807 3.32312 12.9812 3.15448C12.6817 2.98585 12.3437 2.89725 12 2.89725C11.6563 2.89725 11.3183 2.98585 11.0188 3.15448C10.7193 3.32312 10.4683 3.56611 10.29 3.86Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M12 9V13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M12 17H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>Alterar dados</span>
          </button>
        </nav>


        {/* Área principal */}
        <main className="dashboard-main">
          {abaAtiva === "alterarDados" && (
            <div className="section-dados">
              <h2>Seus dados</h2>

              <div className="form-group">
                <label className="form-label">
                  <svg className="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Nome Completo
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formUsuario.nome}
                  onChange={(e) =>
                    setFormUsuario({ ...formUsuario, nome: e.target.value })
                  }
                  className="form-input"
                  placeholder="Digite seu nome completo"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <svg className="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  Data de Nascimento
                </label>
                <input
                  type="date"
                  name="dataNascimento"
                  value={formUsuario.dataNascimento}
                  onChange={(e) =>
                    setFormUsuario({ ...formUsuario, dataNascimento: e.target.value })
                  }
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <svg className="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M21 10C21 17 12 23 12 23C12 23 3 17 3 10C3 7.61305 3.94821 5.32387 5.63604 3.63604C7.32387 1.94821 9.61305 1 12 1C14.3869 1 16.6761 1.94821 18.364 3.63604C20.0518 5.32387 21 7.61305 21 10Z" stroke="currentColor" strokeWidth="2" />
                    <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
                  </svg>
                  CEP
                </label>
                <input
                  type="text"
                  name="cep"
                  value={formUsuario.cep}
                  onChange={(e) =>
                    setFormUsuario({ ...formUsuario, cep: formatarCEP(e.target.value) })
                  }
                  maxLength={9}
                  className="form-input"
                  placeholder="00000-000"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">
                    <svg className="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                      <path d="M7 11V7C7 5.67392 7.52678 4.40215 8.46447 3.46447C9.40215 2.52678 10.6739 2 12 2C13.3261 2 14.5979 2.52678 15.5355 3.46447C16.4732 4.40215 17 5.67392 17 7V11" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    Senha
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={mostrarSenha ? "text" : "password"}
                      name="senha"
                      value={formUsuario.senha}
                      onChange={(e) =>
                        setFormUsuario({ ...formUsuario, senha: e.target.value })
                      }
                      className="form-input"
                      placeholder="Mínimo 6 caracteres"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      tabIndex="-1"
                    >
                      {mostrarSenha ? (
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 3.96914 7.65663 6.06 6.06M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2048 20.84 15.19M14.12 14.12C13.8454 14.4147 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1752 15.0074 10.8016 14.8565C10.4281 14.7056 10.0887 14.4811 9.80385 14.1962C9.51897 13.9113 9.29439 13.5719 9.14351 13.1984C8.99262 12.8248 8.91853 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2218 9.18488 10.8538C9.34884 10.4859 9.58525 10.1546 9.88 9.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M1 1L23 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <svg className="label-icon" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 1C13.3261 1 14.5979 1.52678 15.5355 2.46447C16.4732 3.40215 17 4.67392 17 6V11H7V6C7 4.67392 7.52678 3.40215 8.46447 2.46447C9.40215 1.52678 10.6739 1 12 1Z" stroke="currentColor" strokeWidth="2" />
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="2" />
                    </svg>
                    Confirmar Senha
                  </label>
                  <div className="password-input-wrapper">
                    <input
                      type={mostrarConfirmarSenha ? "text" : "password"}
                      name="confirmarSenha"
                      value={formUsuario.confirmarSenha}
                      onChange={(e) =>
                        setFormUsuario({ ...formUsuario, confirmarSenha: e.target.value })
                      }
                      className="form-input"
                      placeholder="Digite a senha novamente"
                      required
                    />
                    <button
                      type="button"
                      className="password-toggle"
                      onClick={() => setMostrarConfirmarSenha(!mostrarConfirmarSenha)}
                      tabIndex="-1"
                    >
                      {mostrarConfirmarSenha ? (
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17.94 17.94C16.2306 19.243 14.1491 19.9649 12 20C5 20 1 12 1 12C2.24389 9.68192 3.96914 7.65663 6.06 6.06M9.9 4.24C10.5883 4.0789 11.2931 3.99836 12 4C19 4 23 12 23 12C22.393 13.1356 21.6691 14.2048 20.84 15.19M14.12 14.12C13.8454 14.4147 13.5141 14.6512 13.1462 14.8151C12.7782 14.9791 12.3809 15.0673 11.9781 15.0744C11.5753 15.0815 11.1752 15.0074 10.8016 14.8565C10.4281 14.7056 10.0887 14.4811 9.80385 14.1962C9.51897 13.9113 9.29439 13.5719 9.14351 13.1984C8.99262 12.8248 8.91853 12.4247 8.92563 12.0219C8.93274 11.6191 9.02091 11.2218 9.18488 10.8538C9.34884 10.4859 9.58525 10.1546 9.88 9.88" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M1 1L23 23" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <button className="btnSalvar" onClick={salvarAlteracoes} disabled={loading}>
                {loading ? "Salvando..." : "Salvar alterações"}
              </button>
            </div>
          )}
          {abaAtiva === "historicoDenuncia" && (
            <div className="section-denuncias">
              <h2>Suas denúncias</h2>
              {abaAtiva === "historicoDenuncia" && (
                <div className="section-denuncias">
                  {loading ? (
                    <p>Carregando denúncias...</p>
                  ) : denuncias.length === 0 ? (
                    <p>Nenhuma denúncia registrada.</p>
                  ) : (
                    <ul className="lista-denuncias">
                      {denuncias.map((d) => (
                        <li key={d.id_denuncia} className="denuncia-card">

                          <h3>Denúncia #{d.id_denuncia}</h3>

                          <p><strong>Contato denunciado:</strong> {d.contatoDenunciado}</p>

                          <p><strong>Descrição:</strong> {d.descricao || "Não informado"}</p>

                          <p><strong>Valor perdido:</strong>
                            {d.valor ? `R$ ${d.valor.toFixed(2)}` : "Não informado"}
                          </p>

                          <p><strong>Registrou BO?:</strong>
                            {d.boletim ? "Sim" : "Não"}
                          </p>

                          <p><strong>Data do golpe:</strong>
                            {d.dataGolpeOcorrido
                              ? new Date(d.dataGolpeOcorrido).toLocaleDateString()
                              : "Não informado"}
                          </p>

                          <p><strong>Como soube:</strong> {d.comoSoube || "Não informado"}</p>

                          {/* TIPO DO GOLPE */}
                          <p><strong>Tipo de golpe:</strong> {d.tipoGolpe ? golpes[d.tipoGolpe.id_tipo] : d.tipoGolpeOutro || "Não informado"}</p>

                          {/* BANCO */}
                          <p><strong>Banco:</strong> {d.banco ? bancos[d.banco.id_banco] : d.nomeBancoOutro || "Não informado"}</p>

                          <p><strong>Data da denúncia:</strong>
                            {new Date(d.data_denuncia).toLocaleDateString()}
                          </p>

                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

        </main>
      </div>
    </div>
  );
}

export default Dashboard;
