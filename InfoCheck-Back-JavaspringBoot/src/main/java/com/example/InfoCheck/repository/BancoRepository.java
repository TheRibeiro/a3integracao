package com.example.InfoCheck.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import com.example.InfoCheck.entities.Banco;

import java.util.List;
import java.util.Optional;

public interface BancoRepository extends JpaRepository<Banco, Integer> {
    
    // Buscar banco por nome exato (case-insensitive) usando JPQL para evitar conflito de nomenclatura
    @Query("SELECT b FROM Banco b WHERE LOWER(b.nome_banco) = LOWER(:nomeBanco)")
    Optional<Banco> findByNomeBancoIgnoreCase(@Param("nomeBanco") String nomeBanco);

    Optional<Banco> findByCnpj(String cnpj);
    
    // Buscar bancos que contenham o termo no nome (para autocomplete)
    @Query("SELECT b FROM Banco b WHERE LOWER(b.nome_banco) LIKE LOWER(CONCAT('%', :termo, '%'))")
    List<Banco> buscarPorNomeContendo(@Param("termo") String termo);
}
