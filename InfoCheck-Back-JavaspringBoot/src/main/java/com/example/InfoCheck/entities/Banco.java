package com.example.InfoCheck.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(
    name = "bancos",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"nome_banco"}),
        @UniqueConstraint(columnNames = {"cnpj"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Banco {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_banco;

    @Column(nullable = false, length = 100, unique = true)
    private String nome_banco;

    @Column(nullable = false, length = 20, unique = true)
    private String cnpj;

    @Column(length = 200)
    private String site_oficial;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    private LocalDateTime data_cadastro = LocalDateTime.now();
}
