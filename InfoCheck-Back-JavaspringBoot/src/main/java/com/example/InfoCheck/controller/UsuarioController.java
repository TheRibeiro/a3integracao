package com.example.InfoCheck.controller;

import com.example.InfoCheck.dtos.LoginDTO;
import com.example.InfoCheck.dtos.RegistroUsuarioDTO;
import com.example.InfoCheck.dtos.UsuarioUpdateDTO;
import com.example.InfoCheck.entities.Usuario;
import com.example.InfoCheck.service.UsuarioService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioService service;
    private static final Logger log = LoggerFactory.getLogger(UsuarioController.class);

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@RequestBody RegistroUsuarioDTO dto) {
        try {
            Usuario salvo = service.registrar(dto);
            return ResponseEntity.ok(salvo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (DataIntegrityViolationException e) {
            log.warn("Tentativa de registro com CPF duplicado: {}", dto.getCpf());
            return ResponseEntity.status(HttpStatus.CONFLICT).body("CPF ja cadastrado");
        } catch (Exception e) {
            log.error("Erro ao registrar usuario", e);
            return ResponseEntity.internalServerError().body("Erro ao registrar usuario");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO dto) {
        try {
            Usuario usuario = service.login(dto);
            if (usuario == null) {
                return ResponseEntity.status(401).body("CPF ou senha invalidos");
            }
            return ResponseEntity.ok(usuario);
        } catch (Exception e) {
            log.error("Erro ao tentar logar", e);
            return ResponseEntity.internalServerError().body("Erro ao tentar logar");
        }
    }

    @PostMapping("/atualizar")
    public ResponseEntity<?> atualizarUsuario(@RequestBody UsuarioUpdateDTO dto) {
        try {
            Usuario atualizado = service.atualizarUsuario(dto);
            return ResponseEntity.ok(atualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

}
