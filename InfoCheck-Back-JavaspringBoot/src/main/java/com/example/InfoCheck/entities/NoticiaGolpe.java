package com.example.InfoCheck.entities;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "tb_noticia_golpe")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NoticiaGolpe {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 500)
    private String titulo;

    @Column(columnDefinition = "TEXT")
    private String descricao;

    @Column(length = 1000)
    private String urlNoticia;

    @Column(length = 1000)
    private String urlImagem;

    @Column(length = 100)
    private String categoria;

    @Column(nullable = false)
    private LocalDateTime dataPublicacao;

    @Column(nullable = false)
    private LocalDateTime dataCadastro;

    @Column(length = 200)
    private String fonte;

    @Column(length = 500)
    private String tags;

    @PrePersist
    protected void onCreate() {
        dataCadastro = LocalDateTime.now();
    }
}
