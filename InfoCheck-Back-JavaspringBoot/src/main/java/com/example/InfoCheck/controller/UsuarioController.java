package com.example.InfoCheck.controller;

import com.example.InfoCheck.dtos.LoginDTO;
import com.example.InfoCheck.dtos.RegistroUsuarioDTO;
import com.example.InfoCheck.dtos.UsuarioUpdateDTO;
import com.example.InfoCheck.entities.Usuario;
import com.example.InfoCheck.service.UsuarioService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/usuarios")
@CrossOrigin(origins = "*")
public class UsuarioController {

    private final UsuarioService service;

    public UsuarioController(UsuarioService service) {
        this.service = service;
    }

    @PostMapping("/registro")
    public ResponseEntity<?> registrar(@RequestBody RegistroUsuarioDTO dto) {
        try {
            if (dto.getDataNascimento() == null) {
                throw new IllegalArgumentException("dataNascimento é obrigatório");
            }

            Usuario salvo = service.registrar(dto);
            return ResponseEntity.ok(salvo);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Erro ao registrar usuário");
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginDTO dto) {
        try {
            Usuario usuario = service.login(dto);
            if (usuario == null) {
                return ResponseEntity.status(401).body("CPF ou senha inválidos");
            }
            return ResponseEntity.ok(usuario);
        } catch (Exception e) {
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
