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

    @Value("${newsapi.key:YOUR_NEWS_API_KEY_HERE}")
    private String newsApiKey;

    private final RestTemplate restTemplate = new RestTemplate();
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
     * Busca notícias de APIs externas (News API)
     */
    public void buscarNoticiasDeAPIs() {
        log.info("Buscando notícias de APIs externas");
        
        // Se não houver API key configurada, adiciona notícias de exemplo
        if (newsApiKey == null || newsApiKey.equals("YOUR_NEWS_API_KEY_HERE")) {
            log.warn("News API key não configurada. Adicionando notícias de exemplo.");
            adicionarNoticiasDeExemplo();
            return;
        }

        try {
            // Busca notícias para cada palavra-chave
            for (String keyword : KEYWORDS) {
                buscarNoticiasParaKeyword(keyword);
            }
        } catch (Exception e) {
            log.error("Erro ao buscar notícias: {}", e.getMessage());
            // Em caso de erro, adiciona notícias de exemplo
            adicionarNoticiasDeExemplo();
        }
    }

    /**
     * Busca notícias para uma palavra-chave específica usando News API
     */
    private void buscarNoticiasParaKeyword(String keyword) {
        try {
            String encodedKeyword = URLEncoder.encode(keyword, StandardCharsets.UTF_8);
            String url = String.format(
                "https://newsapi.org/v2/everything?q=%s&language=pt&sortBy=publishedAt&pageSize=50&searchIn=title,description,content&apiKey=%s",
                encodedKeyword,
                newsApiKey
            );

            String response = restTemplate.getForObject(url, String.class);
            JsonNode root = objectMapper.readTree(response);
            JsonNode articles = root.get("articles");

            if (articles != null && articles.isArray()) {
                for (JsonNode article : articles) {
                    salvarNoticiaSeNaoExistir(article);
                }
            }
        } catch (Exception e) {
            log.error("Erro ao buscar noticias para keyword '{}': {}", keyword, e.getMessage());
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
