package com.example.InfoCheck.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "contatos_oficiais")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ContatoOficial {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_contato;

    @ManyToOne
    @JoinColumn(name = "id_banco", nullable = false)
    private Banco banco;

    @Column(nullable = false, length = 50)
    private String tipo_contato;

    @Column(nullable = false, length = 150)
    private String valor_contato;

    @Column(columnDefinition = "TEXT")
    private String observacao;

    @Column(nullable = false)
    private Boolean verificado = true;

    @Column(nullable = false)
    private LocalDateTime data_validacao = LocalDateTime.now();
}
