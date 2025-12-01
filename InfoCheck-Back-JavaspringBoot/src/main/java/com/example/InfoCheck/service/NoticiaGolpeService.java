package com.example.InfoCheck.service;

import com.example.InfoCheck.dtos.NoticiaGolpeDTO;
import com.example.InfoCheck.entities.NoticiaGolpe;
import com.example.InfoCheck.repository.NoticiaGolpeRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.ZonedDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@Slf4j
public class NoticiaGolpeService {

    @Autowired
    private NoticiaGolpeRepository noticiaRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${newsapi.key:YOUR_NEWS_API_KEY_HERE}")
    private String newsApiKey;

    private final ObjectMapper objectMapper = new ObjectMapper();
    // Palavras-chave para buscar noticias sobre golpes (lista ampliada, sem acentuacao)
    private static final String[] KEYWORDS = {
        "golpe bancario", "fraude financeira", "golpe pix", "phishing banco",
        "golpe whatsapp banco", "boleto falso", "fraude cartao", "golpe telefone banco",
        "golpe motoboy", "golpe aplicativo bancario", "golpe email banco",
        "scam banco", "fraude digital banco", "roubo de dados bancarios",
        "vazamento de dados banco", "phishing", "fraude pix", "fraude boleto",
        "sms falso banco", "whatsapp falso banco"
    };

    /**
     * Busca todas as notícias ordenadas por data
     */
    public List<NoticiaGolpeDTO> buscarTodasNoticias() {
        log.info("Buscando todas as notícias do banco de dados");
        List<NoticiaGolpe> noticias = noticiaRepository.findAllByOrderByDataPublicacaoDesc();
        return noticias.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Busca notícias por categoria
     */
    public List<NoticiaGolpeDTO> buscarPorCategoria(String categoria) {
        log.info("Buscando notícias da categoria: {}", categoria);
        List<NoticiaGolpe> noticias = noticiaRepository.findByCategoria(categoria);
        return noticias.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Busca notícias recentes (últimas 24 horas)
     */
    public List<NoticiaGolpeDTO> buscarNoticiasRecentes() {
        log.info("Buscando notícias recentes (últimas 24 horas)");
        LocalDateTime umDiaAtras = LocalDateTime.now().minusDays(1);
        List<NoticiaGolpe> noticias = noticiaRepository.findByDataPublicacaoAfterOrderByDataPublicacaoDesc(umDiaAtras);
        return noticias.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Busca notícias por palavra-chave
     */
    public List<NoticiaGolpeDTO> buscarPorPalavraChave(String keyword) {
        log.info("Buscando notícias com palavra-chave: {}", keyword);
        List<NoticiaGolpe> noticias = noticiaRepository
                .findByTituloContainingIgnoreCaseOrDescricaoContainingIgnoreCaseOrderByDataPublicacaoDesc(keyword, keyword);
        return noticias.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    /**
     * Atualiza as notícias buscando de APIs externas
     * Este método é executado automaticamente a cada 30 minutos
     */
    @Scheduled(fixedDelay = 1800000) // 30 minutos
    public void atualizarNoticiasAutomaticamente() {
        log.info("Iniciando atualização automática de notícias");
        buscarNoticiasDeAPIs();
    }

    /**
     * Testa a conectividade com a News API
     * Útil para diagnosticar problemas de rede no Render
     */
    public Map<String, Object> testarConectividadeAPI() {
        Map<String, Object> resultado = new HashMap<>();
        
        log.info("🧪 ============================================");
        log.info("🧪 INICIANDO TESTE DE CONECTIVIDADE");
        log.info("🧪 ============================================");
        
        // Verifica se a API key está configurada
        if (newsApiKey == null || newsApiKey.equals("YOUR_NEWS_API_KEY_HERE")) {
            resultado.put("sucesso", false);
            resultado.put("mensagem", "API Key não configurada");
            resultado.put("detalhes", "Configure a variável de ambiente 'newsapi.key'");
            log.error("❌ API Key não configurada");
            return resultado;
        }
        
        resultado.put("apiKeyConfigurada", true);
        resultado.put("apiKeyPreview", newsApiKey.substring(0, Math.min(8, newsApiKey.length())) + "***");
        
        // Testa uma requisição simples
        try {
            String testKeyword = "teste";
            String encodedKeyword = URLEncoder.encode(testKeyword, StandardCharsets.UTF_8);
            String url = String.format(
                "https://newsapi.org/v2/everything?q=%s&pageSize=1&apiKey=%s",
                encodedKeyword,
                newsApiKey
            );
            
            log.info("🔗 URL de teste: {}", url.replace(newsApiKey, "***"));
            
            long startTime = System.currentTimeMillis();
            String response = restTemplate.getForObject(url, String.class);
            long duration = System.currentTimeMillis() - startTime;
            
            log.info("⏱️ Tempo de resposta: {}ms", duration);
            
            if (response == null || response.isEmpty()) {
                resultado.put("sucesso", false);
                resultado.put("mensagem", "Resposta vazia da API");
                log.error("❌ Resposta vazia");
                return resultado;
            }
            
            JsonNode root = objectMapper.readTree(response);
            String status = root.has("status") ? root.get("status").asText() : "unknown";
            
            if (!status.equals("ok")) {
                String errorMessage = root.has("message") ? root.get("message").asText() : "Erro desconhecido";
                resultado.put("sucesso", false);
                resultado.put("mensagem", "Erro da News API: " + errorMessage);
                resultado.put("statusAPI", status);
                log.error("❌ Erro da API: {}", errorMessage);
                return resultado;
            }
            
            resultado.put("sucesso", true);
            resultado.put("mensagem", "Conectividade OK - API respondeu corretamente");
            resultado.put("tempoResposta", duration + "ms");
            resultado.put("statusAPI", status);
            
            log.info("✅ Conectividade testada com sucesso!");
            log.info("✅ Tempo de resposta: {}ms", duration);
            
        } catch (org.springframework.web.client.ResourceAccessException e) {
            resultado.put("sucesso", false);
            resultado.put("mensagem", "Erro de conectividade - Timeout ou bloqueio de rede");
            resultado.put("erro", e.getMessage());
            resultado.put("causaRaiz", e.getCause() != null ? e.getCause().getMessage() : "Desconhecida");
            log.error("🚫 Erro de conectividade: {}", e.getMessage());
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            resultado.put("sucesso", false);
            resultado.put("mensagem", "Erro HTTP " + e.getStatusCode());
            resultado.put("detalhes", e.getResponseBodyAsString());
            log.error("🚫 Erro HTTP {}: {}", e.getStatusCode(), e.getResponseBodyAsString());
        } catch (Exception e) {
            resultado.put("sucesso", false);
            resultado.put("mensagem", "Erro ao testar conectividade");
            resultado.put("erro", e.getMessage());
            resultado.put("tipoExcecao", e.getClass().getName());
            log.error("❌ Erro genérico: {}", e.getMessage(), e);
        }
        
        log.info("🧪 ============================================");
        log.info("🧪 FIM DO TESTE DE CONECTIVIDADE");
        log.info("🧪 ============================================");
        
        return resultado;
    }


    /**
     * Busca notícias de APIs externas (News API)
     */
    public void buscarNoticiasDeAPIs() {
        log.info("🚀 ============================================");
        log.info("🚀 INICIANDO BUSCA DE NOTÍCIAS DE APIs EXTERNAS");
        log.info("🚀 ============================================");
        
        // Se não houver API key configurada, adiciona notícias de exemplo
        if (newsApiKey == null || newsApiKey.equals("YOUR_NEWS_API_KEY_HERE")) {
            log.warn("⚠️ News API key não configurada. Adicionando notícias de exemplo.");
            adicionarNoticiasDeExemplo();
            return;
        }

        log.info("✅ API Key configurada: {}***", newsApiKey.substring(0, Math.min(8, newsApiKey.length())));
        log.info("📊 Total de palavras-chave a buscar: {}", KEYWORDS.length);

        try {
            int sucessos = 0;
            int falhas = 0;
            
            // Busca notícias para cada palavra-chave
            for (int i = 0; i < KEYWORDS.length; i++) {
                String keyword = KEYWORDS[i];
                log.info("📰 [{}/{}] Buscando keyword: '{}'", i + 1, KEYWORDS.length, keyword);
                
                try {
                    buscarNoticiasParaKeyword(keyword);
                    sucessos++;
                } catch (Exception e) {
                    falhas++;
                    log.error("❌ Falha ao buscar keyword '{}': {}", keyword, e.getMessage());
                }
                
                // Pequena pausa entre requisições para evitar rate limiting
                if (i < KEYWORDS.length - 1) {
                    Thread.sleep(500); // 500ms entre requisições
                }
            }
            
            log.info("📊 ============================================");
            log.info("📊 RESULTADO DA BUSCA:");
            log.info("📊 Sucessos: {} | Falhas: {}", sucessos, falhas);
            log.info("📊 ============================================");
            
        } catch (Exception e) {
            log.error("❌ Erro crítico ao buscar notícias: {}", e.getMessage());
            log.error("❌ Stack trace completo: ", e);
            // Em caso de erro, adiciona notícias de exemplo
            log.warn("⚠️ Adicionando notícias de exemplo como fallback...");
            adicionarNoticiasDeExemplo();
        }
    }

    /**
     * Busca notícias para uma palavra-chave específica usando News API
     */
    private void buscarNoticiasParaKeyword(String keyword) {
        String url = null;
        try {
            String encodedKeyword = URLEncoder.encode(keyword, StandardCharsets.UTF_8);
            url = String.format(
                "https://newsapi.org/v2/everything?q=%s&language=pt&sortBy=publishedAt&pageSize=50&searchIn=title,description,content&apiKey=%s",
                encodedKeyword,
                newsApiKey
            );

            log.info("🔄 Buscando notícias para keyword '{}' na URL: {}", keyword, url.replace(newsApiKey, "***"));
            
            String response = restTemplate.getForObject(url, String.class);
            
            if (response == null || response.isEmpty()) {
                log.warn("⚠️ Resposta vazia da API para keyword '{}'", keyword);
                return;
            }

            log.debug("✅ Resposta recebida da API (primeiros 200 caracteres): {}", 
                      response.length() > 200 ? response.substring(0, 200) + "..." : response);

            JsonNode root = objectMapper.readTree(response);
            
            // Verifica se houve erro na API
            if (root.has("status") && !root.get("status").asText().equals("ok")) {
                String errorMessage = root.has("message") ? root.get("message").asText() : "Erro desconhecido";
                log.error("❌ Erro retornado pela News API: {} (keyword: {})", errorMessage, keyword);
                return;
            }

            JsonNode articles = root.get("articles");

            if (articles != null && articles.isArray()) {
                int articulosProcessados = 0;
                for (JsonNode article : articles) {
                    salvarNoticiaSeNaoExistir(article);
                    articulosProcessados++;
                }
                log.info("✅ Processados {} artigos para keyword '{}'", articulosProcessados, keyword);
            } else {
                log.warn("⚠️ Nenhum artigo encontrado para keyword '{}'", keyword);
            }
        } catch (org.springframework.web.client.ResourceAccessException e) {
            // Erros de timeout ou conectividade
            log.error("🚫 ERRO DE CONECTIVIDADE para keyword '{}': {}. Possível timeout ou bloqueio de rede.", 
                      keyword, e.getMessage());
            log.error("   URL tentada: {}", url != null ? url.replace(newsApiKey, "***") : "N/A");
            log.error("   Causa raiz: {}", e.getCause() != null ? e.getCause().getMessage() : "Desconhecida");
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            // Erros 4xx (cliente)
            log.error("🚫 ERRO HTTP {} ao buscar notícias para keyword '{}': {}", 
                      e.getStatusCode(), keyword, e.getResponseBodyAsString());
            log.error("   Verifique: API Key, limites de requisições, ou URL malformada");
        } catch (org.springframework.web.client.HttpServerErrorException e) {
            // Erros 5xx (servidor)
            log.error("🚫 ERRO DO SERVIDOR (5xx) ao buscar notícias para keyword '{}': {} - {}", 
                      keyword, e.getStatusCode(), e.getMessage());
        } catch (java.net.SocketTimeoutException e) {
            log.error("⏱️ TIMEOUT ao buscar notícias para keyword '{}': A News API demorou demais para responder", keyword);
        } catch (javax.net.ssl.SSLException e) {
            log.error("🔒 ERRO DE SSL para keyword '{}': {}. Possível problema com certificados no Render.", 
                      keyword, e.getMessage());
        } catch (Exception e) {
            log.error("❌ Erro genérico ao buscar noticias para keyword '{}': {}", keyword, e.getMessage());
            log.error("   Tipo de exceção: {}", e.getClass().getName());
            log.error("   Stack trace: ", e);
        }
    }

    /**
     * Salva uma notícia se ela ainda não existir no banco
     */
    private void salvarNoticiaSeNaoExistir(JsonNode article) {
        try {
            String url = article.get("url").asText();

            // Verifica se a notícia já existe
            Optional<NoticiaGolpe> existente = noticiaRepository.findByUrlNoticia(url);
            if (existente.isPresent()) {
                return; // Notícia já existe, não salva novamente
            }

            NoticiaGolpe noticia = new NoticiaGolpe();
            noticia.setTitulo(article.get("title").asText());
            noticia.setDescricao(article.has("description") ? article.get("description").asText() : "");
            noticia.setUrlNoticia(url);
            noticia.setUrlImagem(article.has("urlToImage") ? article.get("urlToImage").asText() : null);
            noticia.setFonte(article.has("source") ? article.get("source").get("name").asText() : "Desconhecida");

            // Parse da data
            String publishedAt = article.get("publishedAt").asText();
            noticia.setDataPublicacao(ZonedDateTime.parse(publishedAt).toLocalDateTime());

            // Define categoria baseada no conteúdo
            noticia.setCategoria(definirCategoria(noticia.getTitulo(), noticia.getDescricao()));

            // Define tags
            noticia.setTags(definirTags(noticia.getTitulo(), noticia.getDescricao()));

            noticiaRepository.save(noticia);
            log.info("Nova notícia salva: {}", noticia.getTitulo());
        } catch (Exception e) {
            log.error("Erro ao salvar notícia: {}", e.getMessage());
        }
    }

    /**
     * Define a categoria da notícia baseada no conteúdo
     */
    private String definirCategoria(String titulo, String descricao) {
        String texto = (titulo + " " + descricao).toLowerCase();

        if (texto.contains("phishing") || texto.contains("e-mail")) {
            return "Phishing";
        } else if (texto.contains("sms") || texto.contains("mensagem")) {
            return "SMS Falso";
        } else if (texto.contains("boleto")) {
            return "Boleto Falso";
        } else if (texto.contains("pix")) {
            return "Golpe PIX";
        } else if (texto.contains("whatsapp") || texto.contains("telefone")) {
            return "Engenharia Social";
        } else if (texto.contains("cartao")) {
            return "Fraude de Cartão";
        }

        return "Alerta Geral";
    }

    /**
     * Define tags para a notícia baseada no conteúdo
     */
    private String definirTags(String titulo, String descricao) {
        List<String> tags = new ArrayList<>();
        String texto = (titulo + " " + descricao).toLowerCase();

        if (texto.contains("urgente") || texto.contains("alerta")) tags.add("Urgente");
        if (texto.contains("banco")) tags.add("Bancos");
        if (texto.contains("pix")) tags.add("PIX");
        if (texto.contains("cartao")) tags.add("Cartão");
        if (texto.contains("senha")) tags.add("Senha");
        if (texto.contains("boleto")) tags.add("Boleto");
        if (texto.contains("telefone")) tags.add("Telefone");
        if (texto.contains("e-mail") || texto.contains("email")) tags.add("E-mail");
        if (texto.contains("sms")) tags.add("SMS");
        if (texto.contains("whatsapp")) tags.add("WhatsApp");

        return String.join(",", tags);
    }

    /**
     * Adiciona notícias de exemplo quando a API não está configurada
     */
    private void adicionarNoticiasDeExemplo() {
        log.info("Adicionando notícias de exemplo");

        List<Map<String, String>> noticiasExemplo = Arrays.asList(
            Map.of(
                "titulo", "Novo golpe usa números muito parecidos com os de bancos oficiais",
                "descricao", "Criminosos estão utilizando números quase idênticos aos de centrais de atendimento para enganar clientes. Especialistas alertam para sempre verificar o contato antes de responder.",
                "categoria", "Phishing",
                "tags", "Telefone,Bancos,Alerta Máximo",
                "fonte", "Portal de Notícias"
            ),
            Map.of(
                "titulo", "Aumento expressivo de tentativas de phishing por SMS em todo o Brasil",
                "descricao", "SMS falsos obtêm sucesso elevado em 'desbloqueio imediato do cartão'. Ao clicar, vítimas são levadas a páginas falsas que solicitam dados bancários.",
                "categoria", "SMS Falso",
                "tags", "SMS,Dados,Urgente",
                "fonte", "Agência de Notícias"
            ),
            Map.of(
                "titulo", "Falso atendente se passa por setor antifraude",
                "descricao", "Novo golpe detectado: criminosos se passam por atendentes de bancos dizendo que o cliente 'confirme dados' para cancelar 'transações suspeitas'. Bancos reforçam que nunca solicitam senhas.",
                "categoria", "Engenharia Social",
                "tags", "Telefone,Senha,Antifraude",
                "fonte", "InfoSec Brasil"
            ),
            Map.of(
                "titulo", "Golpe do boleto falso cresce durante pagamento de impostos",
                "descricao", "Criminosos criam boletos adulterados com código de barras similares. Especialistas alertam para sempre verificar o destinatário antes de realizar o pagamento.",
                "categoria", "Boleto Falso",
                "tags", "Boleto,Impostos,Código de barras",
                "fonte", "Economia Digital"
            ),
            Map.of(
                "titulo", "E-mails falsos imitam notificações de cartão de crédito",
                "descricao", "Golpistas enviam mensagens convincentes sobre 'cartão bloqueado', levando usuários a clicar em links falsos. Ao clicar, usuários são levados a sites que clonam credenciais.",
                "categoria", "Phishing Email",
                "tags", "E-mail,Cartão,Link Falso",
                "fonte", "Tech Security"
            ),
            Map.of(
                "titulo", "Novo golpe do PIX faz vítimas nas redes sociais",
                "descricao", "Criminosos estão utilizando perfis falsos em redes sociais para aplicar golpes envolvendo transferências PIX. Vítimas são enganadas com promessas de promoções inexistentes.",
                "categoria", "Golpe PIX",
                "tags", "PIX,Redes Sociais,Promoção Falsa",
                "fonte", "Segurança Digital"
            ),
            Map.of(
                "titulo", "Golpe do motoboy falso se espalha pelas grandes cidades",
                "descricao", "Falsos motoboys estão recolhendo cartões de crédito e débito em residências, alegando serem funcionários de bancos. Instituições financeiras alertam que nunca enviam motoboys para recolher cartões.",
                "categoria", "Engenharia Social",
                "tags", "Cartão,Motoboy,Presencial",
                "fonte", "Notícias Urbanas"
            ),
            Map.of(
                "titulo", "Aplicativos falsos de bancos proliferam em lojas não oficiais",
                "descricao", "Pesquisadores de segurança identificaram dezenas de aplicativos falsos que imitam apps bancários legítimos. Os apps maliciosos roubam credenciais e dados financeiros dos usuários.",
                "categoria", "Malware Bancário",
                "tags", "Aplicativo,Malware,Dados",
                "fonte", "Cybersecurity News"
            )
        );

        for (Map<String, String> noticiaData : noticiasExemplo) {
            try {
                // Verifica se já existe uma notícia com título similar
                String titulo = noticiaData.get("titulo");
                List<NoticiaGolpe> existentes = noticiaRepository
                    .findByTituloContainingIgnoreCaseOrDescricaoContainingIgnoreCaseOrderByDataPublicacaoDesc(titulo, "");

                if (existentes.isEmpty()) {
                    NoticiaGolpe noticia = new NoticiaGolpe();
                    noticia.setTitulo(titulo);
                    noticia.setDescricao(noticiaData.get("descricao"));
                    noticia.setCategoria(noticiaData.get("categoria"));
                    noticia.setTags(noticiaData.get("tags"));
                    noticia.setFonte(noticiaData.get("fonte"));
                    noticia.setDataPublicacao(LocalDateTime.now().minusHours(new Random().nextInt(48)));
                    noticia.setUrlNoticia("https://exemplo.com/noticia-" + UUID.randomUUID().toString().substring(0, 8));
                    noticia.setUrlImagem(null);

                    noticiaRepository.save(noticia);
                    log.info("Notícia de exemplo salva: {}", titulo);
                }
            } catch (Exception e) {
                log.error("Erro ao salvar notícia de exemplo: {}", e.getMessage());
            }
        }
    }

    /**
     * Converte Entity para DTO
     */
    private NoticiaGolpeDTO convertToDTO(NoticiaGolpe noticia) {
        NoticiaGolpeDTO dto = new NoticiaGolpeDTO();
        dto.setId(noticia.getId());
        dto.setTitulo(noticia.getTitulo());
        dto.setDescricao(noticia.getDescricao());
        dto.setUrlNoticia(noticia.getUrlNoticia());
        dto.setUrlImagem(noticia.getUrlImagem());
        dto.setCategoria(noticia.getCategoria());
        dto.setDataPublicacao(noticia.getDataPublicacao());
        dto.setFonte(noticia.getFonte());
        dto.setTagsFromString(noticia.getTags());
        return dto;
    }
}
