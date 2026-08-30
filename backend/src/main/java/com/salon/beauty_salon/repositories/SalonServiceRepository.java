package com.salon.beauty_salon.repositories;

import com.salon.beauty_salon.entities.SalonService;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SalonServiceRepository extends JpaRepository<SalonService, Long> {

    boolean existsByName(String name);

    boolean existsByNameAndIdNot(String name, Long id);

    List<SalonService> findByActiveTrue();

    boolean existsByNameAndActiveTrue(String name);
}
