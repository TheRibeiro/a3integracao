package com.example.InfoCheck.entities;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@Entity
@Table(name = "denuncias")
public class Denuncia {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_denuncia;

    // Relacionamentos
    @ManyToOne
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @ManyToOne
    @JoinColumn(name = "id_banco")
    private Banco banco;

    @ManyToOne
    @JoinColumn(name = "id_tipo")
    private TipoGolpe tipoGolpe;

    // Campos simples
    @Column(name = "contato_denunciado", nullable = false, length = 150)
    private String contatoDenunciado;

    @Column(name = "descricao", length = 200)
    private String descricao;

    @Column(name = "valor")
    private Double valor;

    @Column(name = "boletim")
    private Boolean boletim;

    @Column(name = "data_golpe_ocorrido")
    private LocalDate dataGolpeOcorrido;

    @Column(name = "como_soube", length = 100)
    private String comoSoube;

    @Column(name = "tipo_golpe_outro", length = 200)
    private String tipoGolpeOutro;

    @Column(name = "nome_banco_outro", length = 200)
    private String nomeBancoOutro;

    @Column(name = "data_denuncia")
    private LocalDateTime data_denuncia = LocalDateTime.now();
}
