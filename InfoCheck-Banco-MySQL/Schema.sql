-- =====================================
-- Schema do Projeto A3 - PostgreSQL (versão com CEP)
-- =====================================

CREATE DATABASE projetoa3;

\c projetoa3

-- 1. Tabela de Usuários (para login/registro)
CREATE TABLE usuarios (
    id_usuario SERIAL PRIMARY KEY,                     -- ID interno do usuário
    nome VARCHAR(100) NOT NULL,                        -- nome completo
    cpf VARCHAR(14) UNIQUE NOT NULL,                   -- CPF (será usado no login)
    data_nascimento DATE NOT NULL,                     -- data de nascimento
    senha VARCHAR(255) NOT NULL,                       -- senha (de preferência, criptografada)
    cep VARCHAR(9) NOT NULL,                           -- CEP onde mora (ex: 12345-678)
    data_registro TIMESTAMP DEFAULT NOW()              -- data do registro
);

-- 2. Tabela de Bancos
CREATE TABLE bancos (
    id_banco SERIAL PRIMARY KEY,
    nome_banco VARCHAR(100) NOT NULL,
    cnpj VARCHAR(20),
    site_oficial VARCHAR(200),
    descricao TEXT,
    data_cadastro TIMESTAMP DEFAULT NOW()
);

-- 3. Tabela de Contatos Oficiais
CREATE TABLE contatos_oficiais (
    id_contato SERIAL PRIMARY KEY,
    id_banco INT NOT NULL REFERENCES bancos(id_banco) ON DELETE CASCADE,
    tipo_contato VARCHAR(50) NOT NULL,
    valor_contato VARCHAR(150) NOT NULL,
    observacao TEXT,
    verificado BOOLEAN DEFAULT TRUE,
    data_validacao TIMESTAMP DEFAULT NOW()
);

-- 4. Tabela de Tipos de Golpe
CREATE TABLE tipos_golpe (
    id_tipo SERIAL PRIMARY KEY,
    nome_tipo VARCHAR(100) NOT NULL,
    descricao TEXT
);

-- 5. Tabela de Denúncias
CREATE TABLE denuncias (
    id_denuncia SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES usuarios(id_usuario) ON DELETE CASCADE, -- quem fez a denúncia
    id_tipo INT REFERENCES tipos_golpe(id_tipo),
    id_banco INT REFERENCES bancos(id_banco),
    contato_denunciado VARCHAR(150) NOT NULL,
    descricao TEXT,
    data_denuncia TIMESTAMP DEFAULT NOW()
);

-- 6. Tabela de Consultas
CREATE TABLE consultas (
    id_consulta SERIAL PRIMARY KEY,
    id_usuario INT REFERENCES usuarios(id_usuario) ON DELETE SET NULL, -- quem fez a consulta (opcional)
    termo_pesquisado VARCHAR(150) NOT NULL,
    resultado_encontrado VARCHAR(50),
    data_consulta TIMESTAMP DEFAULT NOW()
);
