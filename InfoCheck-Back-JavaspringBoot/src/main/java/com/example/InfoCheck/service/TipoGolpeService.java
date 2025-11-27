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

    public List<TipoGolpe> listarTodos(){
        // Busca ordenado e remove duplicados por nome_tipo para evitar repetições no front
        List<TipoGolpe> tipos = repo.findAll(Sort.by("nome_tipo").ascending());
        Map<String, TipoGolpe> unicos = new LinkedHashMap<>();
        for (TipoGolpe tipo : tipos) {
            unicos.putIfAbsent(tipo.getNome_tipo(), tipo);
        }
        return new ArrayList<>(unicos.values());
    }

    public TipoGolpe salvar(TipoGolpe tipo){
        return repo.save(tipo);
    }
}
