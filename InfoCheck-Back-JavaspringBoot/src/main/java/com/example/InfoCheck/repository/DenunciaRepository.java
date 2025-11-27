package com.example.InfoCheck.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.InfoCheck.entities.Denuncia;
import java.time.LocalDateTime;
import java.util.List;

public interface DenunciaRepository extends JpaRepository<Denuncia, Integer> {

        // Buscar por ID do banco
        @Query("SELECT d FROM Denuncia d WHERE d.banco.id_banco = :idBanco")
        List<Denuncia> findByBancoId(@Param("idBanco") Integer idBanco);

        // Buscar por CPF do usuário
        @Query("SELECT d FROM Denuncia d WHERE d.usuario.cpf = :cpf")
        List<Denuncia> findByUsuarioCpf(@Param("cpf") String cpf);

        // Buscar por ID do usuário
        @Query("SELECT d FROM Denuncia d WHERE d.usuario.id_usuario = :idUsuario")
        List<Denuncia> findByUsuarioId(@Param("idUsuario") Integer idUsuario);

        // Buscar por ID do tipo de golpe
        @Query("SELECT d FROM Denuncia d WHERE d.tipoGolpe.id_tipo = :idTipo")
        List<Denuncia> findByTipoId(@Param("idTipo") Integer idTipo);

        // Buscar por mês e ano usando data_denuncia
        @Query("""
                        SELECT d FROM Denuncia d
                        WHERE YEAR(d.data_denuncia) = :ano
                        AND MONTH(d.data_denuncia) = :mes
                        """)
        List<Denuncia> findByAnoMes(
                        @Param("ano") int ano,
                        @Param("mes") int mes);

        // Buscar entre duas datas (com data_denuncia)
        @Query("""
                        SELECT d FROM Denuncia d
                        WHERE d.data_denuncia BETWEEN :inicio AND :fim
                        """)
        List<Denuncia> findBetweenDates(
                        @Param("inicio") LocalDateTime inicio,
                        @Param("fim") LocalDateTime fim);

        @Query("SELECT d FROM Denuncia d WHERE d.usuario.id_usuario = :idUsuario ORDER BY d.data_denuncia DESC")
        List<Denuncia> findByUsuarioOrderByDataDenunciaDesc(@Param("idUsuario") Integer idUsuario);

        // Contar denúncias por contato denunciado (normalizado removendo espaços, pontos, parênteses e traços)
        @Query("""
                SELECT COUNT(d) FROM Denuncia d
                WHERE LOWER(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(d.contatoDenunciado, ' ', ''), '-', ''), '.', ''), '(', ''), ')', ''))
                      = LOWER(:contatoNormalizado)
                """)
        long countByContatoNormalizado(@Param("contatoNormalizado") String contatoNormalizado);

}
