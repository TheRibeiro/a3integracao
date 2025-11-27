package com.example.InfoCheck.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import com.example.InfoCheck.entities.Consulta;
import com.example.InfoCheck.dtos.ConsultaDTO;
import com.example.InfoCheck.service.ConsultaService;
import java.util.List;

@RestController
@RequestMapping("/api/consultas")
@CrossOrigin
public class ConsultaController {

    @Autowired
    private ConsultaService service;

    @PostMapping
    public Consulta registrar(@RequestBody ConsultaDTO dto){
        return service.registrar(dto);
    }

    @GetMapping
    public List<Consulta> listar(){
        return service.listarTodas();
    }
}
