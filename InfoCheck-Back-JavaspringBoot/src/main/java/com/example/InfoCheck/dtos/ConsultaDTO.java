package com.example.InfoCheck.dtos;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ConsultaDTO {
    private Integer idUsuario;
    private String termoPesquisado;
    private String resultadoEncontrado;
}
