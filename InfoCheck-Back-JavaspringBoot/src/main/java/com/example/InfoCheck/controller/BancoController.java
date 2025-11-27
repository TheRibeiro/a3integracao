package com.example.InfoCheck.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.InfoCheck.dtos.BancoDTO;
import com.example.InfoCheck.entities.Banco;
import com.example.InfoCheck.entities.ContatoOficial;
import com.example.InfoCheck.service.BancoService;
import com.example.InfoCheck.service.ContatoOficialService;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bancos")
@CrossOrigin(origins = "*") // liberado para qualquer origem
public class BancoController {

    @Autowired
    private BancoService bancoService;

    @Autowired
    private ContatoOficialService contatoService;

    // Listar todos os bancos
    @GetMapping
    public List<Banco> listar() {
        return bancoService.listarTodos();
    }

    // Criar banco via DTO
    @PostMapping
    public ResponseEntity<?> cadastrar(@RequestBody BancoDTO dto) {
        try {
            Banco salvo = bancoService.criar(dto);
            return ResponseEntity.ok(salvo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(Map.of("message", "Erro ao cadastrar instituicao financeira"));
        }
    }

    // Buscar banco por ID
    @GetMapping("/{id}")
    public ResponseEntity<Banco> buscarPorId(@PathVariable Integer id) {
        Banco banco = bancoService.buscarPorId(id);
        if (banco == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(banco);
    }

    // Buscar banco por nome
    @GetMapping("/buscar")
    public ResponseEntity<Banco> buscarPorNome(@RequestParam String nome) {
        Banco banco = bancoService.buscarPorNome(nome);
        if (banco == null) return ResponseEntity.notFound().build();
        return ResponseEntity.ok(banco);
    }

    // Autocomplete de bancos
    @GetMapping("/autocomplete")
    public List<Banco> autocomplete(@RequestParam String termo) {
        return bancoService.buscarPorNomeContendo(termo);
    }

    // Listar contatos de um banco
    @GetMapping("/{id}/contatos")
    public List<ContatoOficial> listarContatos(@PathVariable Integer id) {
        return contatoService.listarPorBanco(id);
    }

    // Criar contato de um banco
    @PostMapping("/{id}/contatos")
    public ContatoOficial criarContato(@PathVariable Integer id, @RequestBody ContatoOficial contato) {
        return contatoService.salvar(id, contato);
    }
}
