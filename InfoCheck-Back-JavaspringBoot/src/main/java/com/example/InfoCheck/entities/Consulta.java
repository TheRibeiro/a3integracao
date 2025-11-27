package com.example.InfoCheck.entities;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "consultas")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Consulta {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id_consulta;

    @ManyToOne
    @JoinColumn(name = "id_usuario")
    private Usuario usuario;

    @Column(nullable = false, length = 150)
    private String termo_pesquisado;

    @Column(length = 50)
    private String resultado_encontrado;

    @Column(nullable = false)
    private LocalDateTime data_consulta = LocalDateTime.now();
}
