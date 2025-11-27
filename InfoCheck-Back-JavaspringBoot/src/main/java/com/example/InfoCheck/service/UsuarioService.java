package com.example.InfoCheck.service;

import com.example.InfoCheck.dtos.LoginDTO;
import com.example.InfoCheck.dtos.RegistroUsuarioDTO;
import com.example.InfoCheck.dtos.UsuarioUpdateDTO;
import com.example.InfoCheck.entities.Usuario;
import com.example.InfoCheck.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class UsuarioService {

    @Autowired
    private UsuarioRepository usuarioRepo;

    public Usuario registrar(RegistroUsuarioDTO dto) {

        // validação
        if (dto.getDataNascimento() == null) {
            throw new IllegalArgumentException("dataNascimento é obrigatório");
        }

        // criar entidade
        Usuario usuario = new Usuario();
        usuario.setNome(dto.getNome());
        usuario.setCpf(dto.getCpf());
        usuario.setCep(dto.getCep());
        usuario.setSenha(dto.getSenha());
        usuario.setDataNascimento(dto.getDataNascimento());

        // salvar no banco
        return usuarioRepo.save(usuario);
    }

    public Usuario login(LoginDTO dto) {
        return usuarioRepo.findByCpf(dto.getCpf())
                .filter(usuario -> usuario.getSenha().equals(dto.getSenha()))
                .orElse(null); // retorna null se CPF não existir ou senha estiver errada
    }

    public Usuario atualizarUsuario(UsuarioUpdateDTO dto) {
        Integer id = dto.getIdUsuario().intValue();
        Usuario usuario = usuarioRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        usuario.setNome(dto.getNome());
        usuario.setDataNascimento(dto.getDataNascimento());
        usuario.setCep(dto.getCep());

        return usuarioRepo.save(usuario);
    }

}
