package com.example.InfoCheck.dtos;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class VerificacaoContatoDTO {
    private String contato;
    private long totalDenuncias;
    private String confiabilidade;
}
