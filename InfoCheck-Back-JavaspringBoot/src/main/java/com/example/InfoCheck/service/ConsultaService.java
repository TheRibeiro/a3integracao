package com.example.InfoCheck.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.InfoCheck.entities.Consulta;
import com.example.InfoCheck.entities.Usuario;
import com.example.InfoCheck.dtos.ConsultaDTO;
import com.example.InfoCheck.repository.ConsultaRepository;
import com.example.InfoCheck.repository.UsuarioRepository;
import java.util.List;

@Service
public class ConsultaService {

    @Autowired
    private ConsultaRepository consultaRepo;

    @Autowired
    private UsuarioRepository usuarioRepo;

    public Consulta registrar(ConsultaDTO dto){
        Usuario u = null;
        if(dto.getIdUsuario() != null){
            u = usuarioRepo.findById(dto.getIdUsuario()).orElse(null);
        }

        Consulta c = Consulta.builder()
                .usuario(u)
                .termo_pesquisado(dto.getTermoPesquisado())
                .resultado_encontrado(dto.getResultadoEncontrado())
                .build();

        return consultaRepo.save(c);
    }

    public List<Consulta> listarTodas(){
        return consultaRepo.findAll();
    }
}
