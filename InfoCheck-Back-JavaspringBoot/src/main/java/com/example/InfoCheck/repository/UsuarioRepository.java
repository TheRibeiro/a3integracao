package com.example.InfoCheck.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.InfoCheck.entities.Usuario;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Integer> {
    Optional<Usuario> findByCpf(String cpf);
}
