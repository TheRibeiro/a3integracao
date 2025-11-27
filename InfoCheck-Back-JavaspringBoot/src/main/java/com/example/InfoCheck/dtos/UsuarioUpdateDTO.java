package com.example.InfoCheck.dtos;

import java.time.LocalDate;

public class UsuarioUpdateDTO {
    private Integer  idUsuario;
    private String nome;
    private LocalDate dataNascimento;
    private String cep;

    // Getters e Setters
    public Integer  getIdUsuario() { return idUsuario; }
    public void setIdUsuario(Integer  idUsuario) { this.idUsuario = idUsuario; }

    public String getNome() { return nome; }
    public void setNome(String nome) { this.nome = nome; }

    public LocalDate getDataNascimento() { return dataNascimento; }
    public void setDataNascimento(LocalDate dataNascimento) { this.dataNascimento = dataNascimento; }

    public String getCep() { return cep; }
    public void setCep(String cep) { this.cep = cep; }
}
