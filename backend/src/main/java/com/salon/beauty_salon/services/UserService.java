package com.salon.beauty_salon.services;

import com.salon.beauty_salon.dtos.user.*;
import com.salon.beauty_salon.entities.Role;
import com.salon.beauty_salon.entities.SalonService;
import com.salon.beauty_salon.entities.User;
import com.salon.beauty_salon.exceptions.EmailAlreadyExistsException;
import com.salon.beauty_salon.exceptions.InvalidCredentialsException;
import com.salon.beauty_salon.exceptions.InvalidRoleException;
import com.salon.beauty_salon.exceptions.ResourceNotFoundException;
import com.salon.beauty_salon.mappers.UserMapper;
import com.salon.beauty_salon.repositories.SalonServiceRepository;
import com.salon.beauty_salon.repositories.UserRepository;
import com.salon.beauty_salon.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final SalonServiceRepository salonServiceRepository;

    public UserResponse registerUser (UserRegistrationRequest request){

        if(userRepository.existsByEmail(request.getEmail())){
            throw new EmailAlreadyExistsException("The email already exists");
        }

        User newUser = userMapper.toEntity(request);
        newUser.setRole(Role.CLIENT);
        newUser.setPassword(passwordEncoder.encode(request.getPassword()));

        User savedUser = userRepository.save(newUser);

        UserResponse response = userMapper.toDto(savedUser);

        String jwtToken = jwtService.generateToken(savedUser.getEmail());
        response.setToken(jwtToken);

        return response;
    }

    public UserResponse loginUser(UserLoginRequest userLoginRequest){

        User user = userRepository.findByEmail(userLoginRequest.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        if(!passwordEncoder.matches(userLoginRequest.getPassword(), user.getPassword())){
            throw new InvalidCredentialsException("Invalid email or password");
        }

        String jwtToken = jwtService.generateToken(user.getEmail());
        UserResponse userResponseLogin = userMapper.toDto(user);
        userResponseLogin.setToken(jwtToken);

        return userResponseLogin;
    }

    public UserResponse getProfile(String email){
        User user = userRepository.findByEmail(email).orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return userMapper.toDto(user);
    }

    public List<UserResponse> getAllEmployees(){
        List<User> employees = userRepository.findByRole(Role.EMPLOYEE);

        List<User> activeEmployees = employees.stream()
                .filter(User::isActive)
                .collect(Collectors.toList());

        return userMapper.toDtoList(activeEmployees);
    }

    public UserResponse updateProfile(String email, UserProfileUpdateRequest userProfileUpdateRequest){

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setFirstName(userProfileUpdateRequest.getFirstName());
        user.setLastName(userProfileUpdateRequest.getLastName());
        user.setPhoneNumber(userProfileUpdateRequest.getPhoneNumber());

        return userMapper.toDto(userRepository.save(user));
    }

    public void changePassword(String email, ChangePasswordRequest changePasswordRequest){

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if(!passwordEncoder.matches(changePasswordRequest.getOldPassword(), user.getPassword())){
            throw new InvalidCredentialsException("Incorrect old password");
        }

        user.setPassword(passwordEncoder.encode(changePasswordRequest.getNewPassword()));
        userRepository.save(user);
    }

    public UserResponse createEmployee(EmployeeCreateRequest request){

        if(userRepository.existsByEmail(request.getEmail())){
            throw new EmailAlreadyExistsException("The email already exists");
        }

        User newEmployee = userMapper.toEntity(request);
        newEmployee.setRole(Role.EMPLOYEE);
        newEmployee.setPassword(passwordEncoder.encode(request.getPassword()));

        if(request.getServiceIds() != null && !request.getServiceIds().isEmpty()){
            List<SalonService> services = salonServiceRepository.findAllById(request.getServiceIds());
            newEmployee.setServices(new HashSet<>(services));
        }

        User savedEmployee = userRepository.save(newEmployee);

        return userMapper.toDto(savedEmployee);
    }

    public void deactivateEmployee(Long id){
        User employee = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        if(employee.getRole() != Role.EMPLOYEE){
            throw new InvalidRoleException("The selected user is not an employee");
        }

        employee.setActive(false);
        userRepository.save(employee);
    }
}