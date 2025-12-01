package com.example.InfoCheck.controller;

import com.example.InfoCheck.dtos.NoticiaGolpeDTO;
import com.example.InfoCheck.service.NoticiaGolpeService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/noticias")
@CrossOrigin(origins = "*")
@Slf4j
public class NoticiaGolpeController {

    @Autowired
    private NoticiaGolpeService noticiaService;

    /**
     * GET /api/noticias - Busca todas as notícias
     */
    @GetMapping
    public ResponseEntity<List<NoticiaGolpeDTO>> buscarTodasNoticias() {
        log.info("Requisição para buscar todas as notícias");
        try {
            List<NoticiaGolpeDTO> noticias = noticiaService.buscarTodasNoticias();
            return ResponseEntity.ok(noticias);
        } catch (Exception e) {
            log.error("Erro ao buscar notícias: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/noticias/recentes - Busca notícias recentes (últimas 24h)
     */
    @GetMapping("/recentes")
    public ResponseEntity<List<NoticiaGolpeDTO>> buscarNoticiasRecentes() {
        log.info("Requisição para buscar notícias recentes");
        try {
            List<NoticiaGolpeDTO> noticias = noticiaService.buscarNoticiasRecentes();
            return ResponseEntity.ok(noticias);
        } catch (Exception e) {
            log.error("Erro ao buscar notícias recentes: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/noticias/categoria/{categoria} - Busca notícias por categoria
     */
    @GetMapping("/categoria/{categoria}")
    public ResponseEntity<List<NoticiaGolpeDTO>> buscarPorCategoria(@PathVariable String categoria) {
        log.info("Requisição para buscar notícias da categoria: {}", categoria);
        try {
            List<NoticiaGolpeDTO> noticias = noticiaService.buscarPorCategoria(categoria);
            return ResponseEntity.ok(noticias);
        } catch (Exception e) {
            log.error("Erro ao buscar notícias por categoria: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * GET /api/noticias/buscar?q={keyword} - Busca notícias por palavra-chave
     */
    @GetMapping("/buscar")
    public ResponseEntity<List<NoticiaGolpeDTO>> buscarPorPalavraChave(@RequestParam String q) {
        log.info("Requisição para buscar notícias com palavra-chave: {}", q);
        try {
            List<NoticiaGolpeDTO> noticias = noticiaService.buscarPorPalavraChave(q);
            return ResponseEntity.ok(noticias);
        } catch (Exception e) {
            log.error("Erro ao buscar notícias por palavra-chave: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * POST /api/noticias/atualizar - Força atualização das notícias
     */
    @PostMapping("/atualizar")
    public ResponseEntity<Map<String, String>> atualizarNoticias() {
        log.info("Requisição para atualizar notícias manualmente");
        try {
            noticiaService.buscarNoticiasDeAPIs();
            return ResponseEntity.ok(Map.of(
                "mensagem", "Atualização de notícias iniciada com sucesso",
                "status", "success"
            ));
        } catch (Exception e) {
            log.error("Erro ao atualizar notícias: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "mensagem", "Erro ao atualizar notícias",
                    "status", "error",
                    "erro", e.getMessage()
                ));
        }
    }

    /**
     * GET /api/noticias/teste-conectividade - Testa conectividade com News API
     */
    @GetMapping("/teste-conectividade")
    public ResponseEntity<Map<String, Object>> testeConectividade() {
        log.info("Requisição para testar conectividade com News API");
        try {
            Map<String, Object> resultado = noticiaService.testarConectividadeAPI();
            
            boolean sucesso = (boolean) resultado.get("sucesso");
            HttpStatus status = sucesso ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
            
            return ResponseEntity.status(status).body(resultado);
        } catch (Exception e) {
            log.error("Erro ao testar conectividade: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(Map.of(
                    "sucesso", false,
                    "mensagem", "Erro ao testar conectividade",
                    "erro", e.getMessage()
                ));
        }
    }
}
