package com.example.InfoCheck.repository;

import com.example.InfoCheck.entities.NoticiaGolpe;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface NoticiaGolpeRepository extends JpaRepository<NoticiaGolpe, Long> {
    
    // Buscar notícias por categoria
    List<NoticiaGolpe> findByCategoria(String categoria);
    
    // Buscar notícias publicadas após uma data
    List<NoticiaGolpe> findByDataPublicacaoAfterOrderByDataPublicacaoDesc(LocalDateTime data);
    
    // Buscar todas as notícias ordenadas por data de publicação (mais recentes primeiro)
    List<NoticiaGolpe> findAllByOrderByDataPublicacaoDesc();
    
    // Buscar notícia por URL para evitar duplicatas
    Optional<NoticiaGolpe> findByUrlNoticia(String urlNoticia);
    
    // Buscar notícias por palavra-chave no título ou descrição
    List<NoticiaGolpe> findByTituloContainingIgnoreCaseOrDescricaoContainingIgnoreCaseOrderByDataPublicacaoDesc(
        String tituloKeyword, String descricaoKeyword
    );
}
