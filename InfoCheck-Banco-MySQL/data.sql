-- ===========================
-- Arquivo: data.sql (exemplos)
-- ===========================



\c teste

-- 1) Bancos
INSERT INTO bancos (nome_banco, cnpj, site_oficial, descricao, data_cadastro) VALUES
('Banco do Brasil', '00.000.000/0001-91', 'https://www.bb.com.br', 'Banco público federal.', '2025-10-27 10:00:00'),
('Caixa Econômica Federal', '00.000.000/0001-92', 'https://www.caixa.gov.br', 'Banco público para habitação e benefícios.', '2025-10-27 10:05:00'),
('Itaú Unibanco', '00.000.000/0001-93', 'https://www.itau.com.br', 'Banco privado de grande porte.', '2025-10-27 10:10:00');

-- 2) Contatos oficiais
INSERT INTO contatos_oficiais (id_banco, tipo_contato, valor_contato, observacao, verificado, data_validacao) VALUES
(1, 'telefone', '+55 61 4004-0001', 'Central de atendimento principal', TRUE, '2025-10-27 11:00:00'),
(1, 'email', 'atendimento@bb.com.br', 'Canal de suporte ao cliente', TRUE, '2025-10-27 11:05:00'),
(3, 'site', 'https://www.itau.com.br/atendimento', 'Página oficial de atendimento', TRUE, '2025-10-27 11:10:00');

-- 3) Tipos de golpe
INSERT INTO tipos_golpe (nome_tipo, descricao) VALUES
('Phishing', 'Envio de e-mails ou mensagens falsas para obter credenciais ou dados bancários.'),
('Falsa Central de Atendimento', 'Golpista se passa por funcionário do banco via telefone para solicitar dados.'),
('SMS/SMiShing', 'Envio de SMS malicioso com links ou solicitações de dados.');

-- 4) Denúncias
INSERT INTO denuncias (id_tipo, id_banco, contato_denunciado, descricao, data_denuncia) VALUES
(1, 3, '+55 11 99999-0000', 'Recebi e-mail pedindo atualização de login com link suspeito.', '2025-10-27 12:00:00'),
(2, 1, 'atendimento-falso@bb-security.com', 'Ligação pedindo confirmação de senha e CPF.', '2025-10-27 12:15:00'),
(3, 2, 'https://caixa.atualizacao-login.com', 'SMS com link solicitando dados pessoais.', '2025-10-27 12:30:00');

-- 5) Consultas (log)
INSERT INTO consultas (termo_pesquisado, resultado_encontrado, data_consulta) VALUES
('+55 11 99999-0000', 'suspeito', '2025-10-27 13:00:00'),
('atendimento-falso@bb-security.com', 'inexistente', '2025-10-27 13:05:00'),
('https://caixa.atualizacao-login.com', 'suspeito', '2025-10-27 13:10:00'),
('https://www.itau.com.br/atendimento', 'oficial', '2025-10-27 13:15:00');
