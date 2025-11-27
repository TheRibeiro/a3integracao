package com.example.InfoCheck.dtos;

import lombok.Data;

@Data
public class BancoDTO {
    private String cnpj;
    private String descricao;
    private String nome_banco;
    private String site_oficial;
}

