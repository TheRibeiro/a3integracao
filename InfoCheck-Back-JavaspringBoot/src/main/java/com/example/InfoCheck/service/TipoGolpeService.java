package com.example.InfoCheck.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.InfoCheck.entities.TipoGolpe;
import com.example.InfoCheck.repository.TipoGolpeRepository;
import java.util.List;

@Service
public class TipoGolpeService {

    @Autowired
    private TipoGolpeRepository repo;

    public List<TipoGolpe> listarTodos(){
        return repo.findAll();
    }

    public TipoGolpe salvar(TipoGolpe tipo){
        return repo.save(tipo);
    }
}
