package com.example.InfoCheck.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.InfoCheck.entities.ContatoOficial;
import java.util.List;

public interface ContatoOficialRepository extends JpaRepository<ContatoOficial, Integer> {

    @Query("SELECT c FROM ContatoOficial c WHERE c.banco.id_banco = :idBanco")
    List<ContatoOficial> findByBancoId(@Param("idBanco") Integer idBanco);
}
