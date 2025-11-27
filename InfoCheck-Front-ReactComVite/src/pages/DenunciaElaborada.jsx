// src/pages/DenunciaElaborada.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost, apiGet } from "../api";
import "../styles/DenunciaElaborada.css";

function DenunciaElaborada() {
  const navigate = useNavigate();
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [verificandoAuth, setVerificandoAuth] = useState(true);
  const [etapa, setEtapa] = useState(1);
  const [sucesso, setSucesso] = useState(false);
  const [numeroDenuncia, setNumeroDenuncia] = useState("");
  
  // Listas dinâmicas do banco de dados
  const [bancos, setBancos] = useState([]);
  const [tiposGolpe, setTiposGolpe] = useState([]);
  const [carregandoDados, setCarregandoDados] = useState(true);

  const [form, setForm] = useState({
    contato: "",
    tipoGolpe: "",
    tipoGolpeOutro: "",
    banco: "",
    nomeBanco: "",
    valor: "",
    dataOcorrido: "",
    descricao: "",
    comoFicouSabendo: "",
    jaDenunciouPolicia: "nao",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    const stored = localStorage.getItem("usuarioLogado");

    if (!stored) {
      navigate("/login", { replace: true });
      setVerificandoAuth(false);
      return;
    }

    try {
      setUsuarioLogado(JSON.parse(stored));
      setVerificandoAuth(false);
      carregarDadosIniciais();
    } catch (error) {
      console.error("Erro ao recuperar usuário logado:", error);
      localStorage.removeItem("usuarioLogado");
      setVerificandoAuth(false);
      navigate("/login", { replace: true });
    }
  }, [navigate]);

  // Carregar bancos e tipos de golpe do banco de dados
  const carregarDadosIniciais = async () => {
    setCarregandoDados(true);
    try {
      const [bancosData, tiposData] = await Promise.all([
        apiGet("/api/bancos"),
        apiGet("/api/tipos-golpe")
      ]);
      
      setBancos(bancosData || []);
      setTiposGolpe(tiposData || []);
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      alert("Erro ao carregar dados do formulário. Tente novamente.");
    } finally {
      setCarregandoDados(false);
    }
  };

  const proximaEtapa = () => {
    // Validações antes de avançar
    if (etapa === 1) {
      if (!form.contato.trim()) {
        alert("Por favor, informe o contato do suspeito.");
        return;
      }
      if (!form.tipoGolpe) {
        alert("Por favor, selecione o tipo de golpe.");
        return;
      }
      if (form.tipoGolpe === "outro" && !form.tipoGolpeOutro.trim()) {
        alert("Por favor, especifique o tipo de golpe.");
        return;
      }
      if (!form.banco) {
        alert("Por favor, selecione o banco envolvido.");
        return;
      }
      if (form.banco === "outro" && !form.nomeBanco.trim()) {
        alert("Por favor, informe o nome do banco.");
        return;
      }
    }
    
    if (etapa === 2) {
      if (!form.descricao.trim()) {
        alert("Por favor, descreva o que ocorreu.");
        return;
      }
    }
    
    if (etapa < 3) {
      setEtapa(etapa + 1);
    }
  };

  const voltarEtapa = () => etapa > 1 && setEtapa(etapa - 1);

  const enviarDenuncia = async (e) => {
    e.preventDefault();

    if (form.valor && parseFloat(form.valor) < 0) {
      alert("O valor não pode ser negativo.");
      return;
    }

    if (form.dataOcorrido) {
      const hoje = new Date();
      const dataInformada = new Date(form.dataOcorrido);
      if (dataInformada > hoje) {
        alert("A data do ocorrido não pode estar no futuro.");
        return;
      }
    }

    try {
      const dados = {
        idUsuario: usuarioLogado?.id_usuario,
        idBanco: form.banco !== "outro" ? parseInt(form.banco) : null,
        idTipoGolpe: form.tipoGolpe !== "outro" ? parseInt(form.tipoGolpe) : null,

        contatoDenunciado: form.contato,
        descricao: form.descricao,
        valor: form.valor !== "" ? parseFloat(form.valor) : null,
        boletim: form.jaDenunciouPolicia === "sim",

        dataGolpeOcorrido: form.dataOcorrido || null,
        comoSoube: form.comoFicouSabendo || null,

        tipoGolpeOutro: form.tipoGolpe === "outro" ? form.tipoGolpeOutro : null,
        nomeBancoOutro: form.banco === "outro" ? form.nomeBanco : null
      };
      
            if (!dados.idUsuario) {
        alert('Sessao expirada. Faca login novamente.');
        navigate('/login');
        return;
      }

      await apiPost("/api/denuncias", dados);

      const numero = `000${Date.now()}`.slice(-13);
      setNumeroDenuncia(numero);
      setSucesso(true);
    } catch (err) {
      console.error("Erro ao enviar denúncia:", err);
      alert("Erro ao enviar denúncia. Tente novamente.");
    }
  };

  if (verificandoAuth || carregandoDados) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Carregando...</p>
      </div>
    );
  }

  if (sucesso) {
    return (
      <div className="sucesso-container">
        <div className="sucesso-card">
          <h2>Denúncia Registrada</h2>
          <p className="numero">N°: {numeroDenuncia}</p>

          <div className="check-icon">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="12" r="10" stroke="#10b981" strokeWidth="2" fill="none" />
              <path d="M8 12L11 15L16 9" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          <p className="msg-principal">Sua denúncia foi registrada com sucesso.</p>
          <p className="msg-secundaria">
            Nossa equipe analisará as informações e poderá entrar em contato.
          </p>
          <p className="msg-final">
            Sua ação ajuda a proteger outras pessoas. Obrigado por confiar no InfoCheck.
          </p>

          <div className="botoes-finais">
            <button className="btn-acompanhar" onClick={() => navigate("/dashboard")}>
              Acompanhar denúncia
            </button>
            <button className="btn-voltar-inicio" onClick={() => navigate("/")}>
              Voltar ao início
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="denuncia-elaborada-container">
      <header className="denuncia-header">
        <h1 className="logo" onClick={() => navigate("/")}>
          <svg className="logo-icon" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" strokeWidth="2" />
            <path d="M2 17L12 22L22 17" stroke="currentColor" strokeWidth="2" />
            <path d="M2 12L12 17L22 12" stroke="currentColor" strokeWidth="2" />
          </svg>
          InfoCheck
          <svg className="logo-check" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17L4 12" stroke="#10b981" strokeWidth="3" />
          </svg>
        </h1>
      </header>

      <main className="denuncia-main">
        <div className="denuncia-card">
          <h2>Registrar Denúncia Detalhada</h2>
          <p className="subtitulo">Ajude a comunidade com informações completas</p>

          {/* Indicador */}
          <div className="etapas-indicador">
            <div className={`etapa ${etapa >= 1 ? "active" : ""}`}>
              <span>1</span><p>Básico</p>
            </div>
            <div className={`linha ${etapa >= 2 ? "active" : ""}`} />
            <div className={`etapa ${etapa >= 2 ? "active" : ""}`}>
              <span>2</span><p>Detalhes</p>
            </div>
            <div className={`linha ${etapa >= 3 ? "active" : ""}`} />
            <div className={`etapa ${etapa >= 3 ? "active" : ""}`}>
              <span>3</span><p>Confirmação</p>
            </div>
          </div>

          <form onSubmit={enviarDenuncia}>

            {/* --- ETAPA 1 --- */}
            {etapa === 1 && (
              <div className="etapa-content">
                <h3>Informações Básicas</h3>

                <div className="form-group">
                  <label>Contato do Suspeito *</label>
                  <input
                    type="text"
                    name="contato"
                    value={form.contato}
                    onChange={handleChange}
                    placeholder="Telefone, e-mail, PIX..."
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Tipo de Golpe *</label>
                    <select name="tipoGolpe" value={form.tipoGolpe} onChange={handleChange} required>
                      <option value="">Selecione...</option>
                      {tiposGolpe.map((tipo) => (
                        <option key={tipo.id_tipo} value={tipo.id_tipo}>
                          {tipo.nome_tipo}
                        </option>
                      ))}
                      <option value="outro">Outro (especificar)</option>
                    </select>

                    {form.tipoGolpe === "outro" && (
                      <input
                        type="text"
                        name="tipoGolpeOutro"
                        value={form.tipoGolpeOutro}
                        onChange={handleChange}
                        required
                        className="mt-2"
                        placeholder="Digite o tipo de golpe..."
                      />
                    )}
                  </div>

                  <div className="form-group">
                    <label>Banco Envolvido *</label>
                    <select name="banco" value={form.banco} onChange={handleChange} required>
                      <option value="">Selecione...</option>
                      {bancos.map((banco) => (
                        <option key={banco.id_banco} value={banco.id_banco}>
                          {banco.nome_banco}
                        </option>
                      ))}
                      <option value="outro">Outro banco</option>
                    </select>

                    {form.banco === "outro" && (
                      <input
                        type="text"
                        name="nomeBanco"
                        value={form.nomeBanco}
                        onChange={handleChange}
                        required
                        className="mt-2"
                        placeholder="Nome do banco..."
                      />
                    )}
                  </div>
                </div>

                <button type="button" className="btn-proximo" onClick={proximaEtapa}>
                  Próximo →
                </button>
              </div>
            )}

            {/* --- ETAPA 2 --- */}
            {etapa === 2 && (
              <div className="etapa-content">
                <h3>Detalhes do Golpe</h3>

                <div className="form-row">
                  <div className="form-group">
                    <label>Valor Envolvido (R$)</label>
                    <input
                      type="number"
                      name="valor"
                      value={form.valor}
                      onChange={handleChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>

                  <div className="form-group">
                    <label>Data do Ocorrido</label>
                    <input
                      type="date"
                      name="dataOcorrido"
                      value={form.dataOcorrido}
                      onChange={handleChange}
                      max={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Descrição Detalhada *</label>
                  <textarea
                    name="descricao"
                    value={form.descricao}
                    onChange={handleChange}
                    required
                    rows="5"
                    placeholder="Explique detalhadamente o que ocorreu..."
                  />
                </div>

                <div className="form-group">
                  <label>Como ficou sabendo que era golpe?</label>
                  <input
                    type="text"
                    name="comoFicouSabendo"
                    value={form.comoFicouSabendo}
                    onChange={handleChange}
                    placeholder="Ex: Liguei no banco e confirmaram."
                  />
                </div>

                <div className="botoes-navegacao">
                  <button type="button" className="btn-voltar" onClick={voltarEtapa}>← Voltar</button>
                  <button type="button" className="btn-proximo" onClick={proximaEtapa}>Próximo →</button>
                </div>
              </div>
            )}

            {/* --- ETAPA 3 --- */}
            {etapa === 3 && (
              <div className="etapa-content">
                <h3>Confirmação</h3>

                <div className="form-group">
                  <label>Já registrou Boletim de Ocorrência?</label>
                  <div className="radio-group">
                    <label className="radio-label">
                      <input
                        type="radio"
                        name="jaDenunciouPolicia"
                        value="sim"
                        checked={form.jaDenunciouPolicia === "sim"}
                        onChange={handleChange}
                      />
                      <span>Sim</span>
                    </label>

                    <label className="radio-label">
                      <input
                        type="radio"
                        name="jaDenunciouPolicia"
                        value="nao"
                        checked={form.jaDenunciouPolicia === "nao"}
                        onChange={handleChange}
                      />
                      <span>Não</span>
                    </label>
                  </div>
                </div>

                <div className="resumo-denuncia">
                  <h4>Resumo</h4>
                  <p><strong>Contato:</strong> {form.contato}</p>
                  <p><strong>Tipo:</strong> {
                    form.tipoGolpe === "outro" 
                      ? form.tipoGolpeOutro 
                      : tiposGolpe.find(t => t.id_tipo === parseInt(form.tipoGolpe))?.nome_tipo
                  }</p>
                  <p><strong>Banco:</strong> {
                    form.banco === "outro" 
                      ? form.nomeBanco 
                      : bancos.find(b => b.id_banco === parseInt(form.banco))?.nome_banco
                  }</p>
                  {form.valor && <p><strong>Valor:</strong> R$ {form.valor}</p>}
                  {form.dataOcorrido && <p><strong>Data:</strong> {new Date(form.dataOcorrido + 'T00:00').toLocaleDateString('pt-BR')}</p>}
                </div>

                <div className="botoes-navegacao">
                  <button type="button" className="btn-voltar" onClick={voltarEtapa}>← Voltar</button>
                  <button type="submit" className="btn-enviar">✓ Enviar Denúncia</button>
                </div>
              </div>
            )}

          </form>
        </div>
      </main>
    </div>
  );
}

export default DenunciaElaborada;
