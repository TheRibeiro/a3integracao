package com.example.InfoCheck.service;

import com.example.InfoCheck.dtos.LoginDTO;
import com.example.InfoCheck.dtos.RegistroUsuarioDTO;
import com.example.InfoCheck.dtos.UsuarioUpdateDTO;
import com.example.InfoCheck.entities.Usuario;
import com.example.InfoCheck.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepo;

    public Usuario registrar(RegistroUsuarioDTO dto) {
        String cpfLimpo = dto.getCpf() != null ? dto.getCpf().replaceAll("\\D", "") : "";
        String cepLimpo = dto.getCep() != null ? dto.getCep().replaceAll("\\D", "") : "";

        if (dto.getDataNascimento() == null) {
            throw new IllegalArgumentException("dataNascimento eh obrigatorio");
        }
        if (cpfLimpo.length() != 11) {
            throw new IllegalArgumentException("CPF deve ter 11 digitos");
        }
        if (cepLimpo.length() != 8) {
            throw new IllegalArgumentException("CEP deve ter 8 digitos");
        }

        usuarioRepo.findByCpf(cpfLimpo).ifPresent(u -> {
            throw new DataIntegrityViolationException("CPF ja cadastrado");
        });

        Usuario usuario = new Usuario();
        usuario.setNome(dto.getNome());
        usuario.setCpf(cpfLimpo);
        usuario.setCep(cepLimpo);
        usuario.setSenha(dto.getSenha());
        usuario.setDataNascimento(dto.getDataNascimento());

        return usuarioRepo.save(usuario);
    }

    public Usuario login(LoginDTO dto) {
        return usuarioRepo.findByCpf(dto.getCpf())
                .filter(usuario -> usuario.getSenha().equals(dto.getSenha()))
                .orElse(null); // retorna null se CPF nao existir ou senha estiver errada
    }

    public Usuario atualizarUsuario(UsuarioUpdateDTO dto) {
        Integer id = dto.getIdUsuario().intValue();
        Usuario usuario = usuarioRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario nao encontrado"));

        usuario.setNome(dto.getNome());
        usuario.setDataNascimento(dto.getDataNascimento());
        usuario.setCep(dto.getCep());

        return usuarioRepo.save(usuario);
    }

}
