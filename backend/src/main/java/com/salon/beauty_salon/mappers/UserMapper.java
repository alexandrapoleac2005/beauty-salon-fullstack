package com.salon.beauty_salon.mappers;

import com.salon.beauty_salon.dtos.user.EmployeeCreateRequest;
import com.salon.beauty_salon.dtos.user.UserRegistrationRequest;
import com.salon.beauty_salon.dtos.user.UserResponse;
import com.salon.beauty_salon.entities.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import java.util.List;

@Mapper(componentModel = "spring", uses = {SalonServiceMapper.class})
public interface UserMapper {

    User toEntity(UserRegistrationRequest request);

    @Mapping(target = "services", ignore = true)
    User toEntity(EmployeeCreateRequest request);

    UserResponse toDto(User entity);

    List<UserResponse> toDtoList(List<User> entities);
}
