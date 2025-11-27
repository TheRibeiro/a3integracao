package com.example.InfoCheck.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.InfoCheck.entities.ContatoOficial;
import com.example.InfoCheck.entities.Banco;
import com.example.InfoCheck.repository.ContatoOficialRepository;
import com.example.InfoCheck.repository.BancoRepository;

import java.util.List;

@Service
public class ContatoOficialService {

    @Autowired
    private ContatoOficialRepository repo;

    @Autowired
    private BancoRepository bancoRepo;

    // Listar todos os contatos de um banco
    public List<ContatoOficial> listarPorBanco(Integer idBanco) {
        return repo.findByBancoId(idBanco);
    }

    // Salvar um contato associado a um banco
    public ContatoOficial salvar(Integer idBanco, ContatoOficial contato) {
        Banco banco = bancoRepo.findById(idBanco).orElse(null);
        if (banco == null) {
            throw new RuntimeException("Banco não encontrado com ID: " + idBanco);
        }
        contato.setBanco(banco);
        return repo.save(contato);
    }
}
