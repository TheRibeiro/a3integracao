package com.example.InfoCheck.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.InfoCheck.entities.Consulta;

public interface ConsultaRepository extends JpaRepository<Consulta, Integer> {
}
