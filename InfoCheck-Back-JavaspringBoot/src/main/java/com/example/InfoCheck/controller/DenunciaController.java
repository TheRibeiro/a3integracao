package com.example.InfoCheck.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import com.example.InfoCheck.entities.Denuncia;
import com.example.InfoCheck.dtos.DenunciaDTO;
import com.example.InfoCheck.dtos.VerificacaoContatoDTO;
import com.example.InfoCheck.service.DenunciaService;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/denuncias")
@CrossOrigin
public class DenunciaController {

    private final DenunciaService service;

    public DenunciaController(DenunciaService service) {
        this.service = service;
    }

    // Criar denúncia
    @PostMapping
    public Denuncia criar(@RequestBody DenunciaDTO dto) {
        return service.criar(dto);
    }

    // Listar todas
    @GetMapping
    public List<Denuncia> listarTodas() {
        return service.listarTodas();
    }

    // Buscar por ID do banco
    @GetMapping("/banco/{idBanco}")
    public List<Denuncia> listarPorBanco(@PathVariable Integer idBanco) {
        return service.listarPorBanco(idBanco);
    }

    // Buscar por CPF do usuário
    @GetMapping("/usuarios/cpf/{cpf}")
    public List<Denuncia> listarPorCpf(@PathVariable String cpf) {
        return service.listarPorCpf(cpf);
    }

    // Buscar por ID do usuário (PRECISA EXISTIR NO SERVICE)
    @GetMapping("/usuarios/id/{idUsuario}")
    public List<Denuncia> listarPorIdUsuario(@PathVariable Integer idUsuario) {
        return service.listarPorIdUsuario(idUsuario);
    }

    // Buscar por tipo de golpe (PRECISA EXISTIR NO SERVICE)
    @GetMapping("/tipo/{idTipo}")
    public List<Denuncia> listarPorTipo(@PathVariable Integer idTipo) {
        return service.listarPorTipo(idTipo);
    }

    // Buscar por mês e ano (PRECISA EXISTIR NO SERVICE)
    @GetMapping("/data/{ano}/{mes}")
    public List<Denuncia> listarPorMesAno(@PathVariable int ano, @PathVariable int mes) {
        return service.listarPorMesAno(ano, mes);
    }

    // Buscar entre duas datas (PRECISA EXISTIR NO SERVICE)
    @GetMapping("/data/{dataInicio}/{dataFim}")
    public List<Denuncia> listarEntreDatas(
            @PathVariable LocalDate dataInicio,
            @PathVariable LocalDate dataFim) {
        return service.listarEntreDatas(dataInicio, dataFim);
    }

    @GetMapping("/usuarios/{idUsuario}")
    public ResponseEntity<List<Denuncia>> getDenunciasPorUsuario(@PathVariable Integer idUsuario) {
        List<Denuncia> denuncias = service.buscarPorUsuario(idUsuario);
        return ResponseEntity.ok(denuncias);
    }

    @GetMapping("/usuarios/{idUsuario}/denuncias")
    public ResponseEntity<List<Denuncia>> listarDenunciasPorUsuario(@PathVariable Integer idUsuario) {
        List<Denuncia> denuncias = service.listarDenunciasPorUsuario(idUsuario);
        return ResponseEntity.ok(denuncias);
    }

    // Verificar contato - retorna contagem de denúncias e nível de confiabilidade
    @GetMapping("/contato/{contato}")
    public ResponseEntity<?> verificarContato(@PathVariable String contato) {
        try {
            if (contato == null || contato.trim().isEmpty()) {
                return ResponseEntity.badRequest().body("Contato não pode ser vazio");
            }

            VerificacaoContatoDTO resultado = service.verificarContato(contato);
            return ResponseEntity.ok(resultado);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro ao verificar contato: " + e.getMessage());
        }
    }

}
