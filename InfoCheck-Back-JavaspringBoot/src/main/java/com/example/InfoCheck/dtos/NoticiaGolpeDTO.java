package com.example.InfoCheck.dtos;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NoticiaGolpeDTO {
    private Long id;
    private String titulo;
    private String descricao;
    private String urlNoticia;
    private String urlImagem;
    private String categoria;
    private LocalDateTime dataPublicacao;
    private String fonte;
    private List<String> tags;
    
    // Método auxiliar para converter tags de String para List e vice-versa
    public void setTagsFromString(String tagsString) {
        if (tagsString != null && !tagsString.isEmpty()) {
            this.tags = List.of(tagsString.split(","));
        }
    }
    
    public String getTagsAsString() {
        if (tags != null && !tags.isEmpty()) {
            return String.join(",", tags);
        }
        return "";
    }
}
