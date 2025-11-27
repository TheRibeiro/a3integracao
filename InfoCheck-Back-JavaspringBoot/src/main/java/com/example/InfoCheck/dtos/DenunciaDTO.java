package com.example.InfoCheck.dtos;

import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DenunciaDTO {

    private Integer idUsuario;        // FK usuário
    private Integer idBanco;          // FK banco (pode ser null)
    private Integer idTipoGolpe;      // FK tipo (pode ser null)

    private String contatoDenunciado; // telefone/email/site denunciado
    private String descricao;         // descrição da denúncia

    private Double valor;             // valor perdido
    private Boolean boletim;          // se registrou B.O
    private LocalDate dataGolpeOcorrido; // data do golpe
    private String comoSoube;         // como descobriu golpe

    // Campos "Outro"
    private String tipoGolpeOutro;    // texto quando tipo = Outro
    private String nomeBancoOutro;    // texto quando banco = Outro

}
