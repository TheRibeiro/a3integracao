package com.example.InfoCheck.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.InfoCheck.entities.TipoGolpe;
import com.example.InfoCheck.service.TipoGolpeService;
import java.util.List;

@RestController
@RequestMapping("/api/tipos-golpe")
@CrossOrigin
public class TipoGolpeController {

    @Autowired
    private TipoGolpeService service;

    @GetMapping
    public List<TipoGolpe> listar(){
        return service.listarTodos();
    }

    @PostMapping
    public TipoGolpe criar(@RequestBody TipoGolpe tipo){
        return service.salvar(tipo);
    }
}
