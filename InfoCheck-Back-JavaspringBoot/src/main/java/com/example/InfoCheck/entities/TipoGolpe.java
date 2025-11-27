package com.example.InfoCheck.entities;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "tipos_golpe")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TipoGolpe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_tipo;

    @Column(nullable = false, length = 100)
    private String nome_tipo;

    @Column(columnDefinition = "TEXT")
    private String descricao;
}
