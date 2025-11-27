-- Seeds para a tabela bancos
INSERT INTO bancos (nome_banco, cnpj, site_oficial, descricao, data_cadastro) VALUES
('Bradesco','60746948000112','https://banco.bradesco/html/classic/index.shtm','Banco Bradesco', CURRENT_TIMESTAMP)
ON CONFLICT (nome_banco) DO NOTHING;

INSERT INTO bancos (nome_banco, cnpj, site_oficial, descricao, data_cadastro) VALUES
('Itau','60701190000104','https://www.itau.com.br','Banco Itau', CURRENT_TIMESTAMP)
ON CONFLICT (nome_banco) DO NOTHING;

INSERT INTO bancos (nome_banco, cnpj, site_oficial, descricao, data_cadastro) VALUES
('Santander','90400888000142','https://www.santander.com.br','Banco Santander', CURRENT_TIMESTAMP)
ON CONFLICT (nome_banco) DO NOTHING;

INSERT INTO bancos (nome_banco, cnpj, site_oficial, descricao, data_cadastro) VALUES
('Nubank','18727053000158','https://nubank.com.br','Nubank', CURRENT_TIMESTAMP)
ON CONFLICT (nome_banco) DO NOTHING;

INSERT INTO bancos (nome_banco, cnpj, site_oficial, descricao, data_cadastro) VALUES
('Banco do Brasil','00000000000001','https://www.bb.com.br','Banco do Brasil', CURRENT_TIMESTAMP)
ON CONFLICT (nome_banco) DO NOTHING;

INSERT INTO bancos (nome_banco, cnpj, site_oficial, descricao, data_cadastro) VALUES
('Caixa Economica Federal','00000000000002','https://www.caixa.gov.br','Caixa Economica Federal', CURRENT_TIMESTAMP)
ON CONFLICT (nome_banco) DO NOTHING;

-- Usuario demo para evitar erro de id inexistente nas denuncias
INSERT INTO usuarios (nome, cpf, data_nascimento, senha, cep)
VALUES ('Usuario Demo','12345678901','1990-01-01','1234','01001000');

-- Tipos de golpe base
INSERT INTO tipos_golpe (nome_tipo, descricao) VALUES
('Phishing', 'E-mails ou mensagens falsas para capturar dados pessoais/financeiros'),
('Golpe do WhatsApp', 'Perfis falsos ou clonados pedindo dinheiro'),
('Falso boleto', 'Boletos adulterados para desviar pagamento'),
('Clonagem de cartão', 'Uso indevido dos dados do cartão para compras');

-- Denúncias de exemplo (persistentes)
INSERT INTO denuncias (
  id_usuario, id_banco, id_tipo, contato_denunciado, descricao, valor, boletim,
  data_golpe_ocorrido, como_soube, tipo_golpe_outro, nome_banco_outro, data_denuncia
) VALUES
(1, 1, 1, '+55 11 99999-1111', 'Ligação se passando pelo banco pedindo dados pessoais.', 1500.00, TRUE,
 '2025-11-01', 'Confirmei no app do banco', NULL, NULL, CURRENT_TIMESTAMP),
(1, 3, 2, '+55 11 98888-2222', 'WhatsApp clonado pedindo transferência urgente.', 800.00, FALSE,
 '2025-10-28', 'Aviso de segurança do banco', NULL, NULL, CURRENT_TIMESTAMP),
(1, 4, 3, 'boleto@falso.com', 'Boleto adulterado enviado por e-mail.', 2300.50, TRUE,
 '2025-09-15', 'Conferi o código de barras com o banco', NULL, NULL, CURRENT_TIMESTAMP);
