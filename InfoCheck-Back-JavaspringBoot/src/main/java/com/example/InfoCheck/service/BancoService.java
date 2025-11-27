package com.example.InfoCheck.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.example.InfoCheck.dtos.BancoDTO;
import com.example.InfoCheck.entities.Banco;
import com.example.InfoCheck.repository.BancoRepository;

import java.util.List;

@Service
public class BancoService {

    @Autowired
    private BancoRepository repo;

    public List<Banco> listarTodos() {
        return repo.findAll();
    }

    public Banco salvar(Banco banco) {
        return repo.save(banco);
    }

    public Banco buscarPorId(Integer id) {
        return repo.findById(id).orElse(null);
    }

    public Banco buscarPorNome(String nome) {
        return repo.findByNomeBancoIgnoreCase(nome).orElse(null);
    }

    public List<Banco> buscarPorNomeContendo(String termo) {
        return repo.buscarPorNomeContendo(termo);
    }

    public Banco criar(BancoDTO dto) {
        String nome = dto.getNome_banco() == null ? "" : dto.getNome_banco().trim();
        String cnpj = dto.getCnpj() == null ? "" : dto.getCnpj().replaceAll("\\D", "");

        if (nome.isEmpty() || cnpj.isEmpty()) {
            throw new IllegalArgumentException("Nome e CNPJ são obrigatórios");
        }

        repo.findByNomeBancoIgnoreCase(nome).ifPresent(b -> {
            throw new IllegalArgumentException("Instituicao financeira já cadastrada com esse nome");
        });

        repo.findByCnpj(cnpj).ifPresent(b -> {
            throw new IllegalArgumentException("Instituicao financeira já cadastrada com esse CNPJ");
        });

        Banco banco = new Banco();
        banco.setCnpj(cnpj);
        banco.setDescricao(dto.getDescricao());
        banco.setNome_banco(nome);
        banco.setSite_oficial(dto.getSite_oficial());
        return repo.save(banco);
    }
}
