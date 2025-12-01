package com.example.InfoCheck.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import com.example.InfoCheck.entities.TipoGolpe;
import com.example.InfoCheck.repository.TipoGolpeRepository;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class TipoGolpeService {

    @Autowired
    private TipoGolpeRepository repo;

    public List<TipoGolpe> listarTodos() {
        try {
            List<TipoGolpe> tipos = repo.findAll();

            // Deduplicar e Ordenar em memória para evitar erro de
            // PropertyReferenceException
            Map<String, TipoGolpe> unicos = new LinkedHashMap<>();

            tipos.stream()
                    .filter(t -> t.getNome_tipo() != null)
                    .sorted((t1, t2) -> t1.getNome_tipo().compareToIgnoreCase(t2.getNome_tipo()))
                    .forEach(t -> unicos.putIfAbsent(t.getNome_tipo(), t));

            return new ArrayList<>(unicos.values());
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erro ao listar tipos de golpe: " + e.getMessage());
        }
    }

    public TipoGolpe salvar(TipoGolpe tipo) {
        return repo.save(tipo);
    }
}
