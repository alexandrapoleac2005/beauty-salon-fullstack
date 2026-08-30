package com.salon.beauty_salon.services;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import com.salon.beauty_salon.dtos.user.*;
import com.salon.beauty_salon.entities.Role;
import com.salon.beauty_salon.entities.User;
import com.salon.beauty_salon.exceptions.EmailAlreadyExistsException;
import com.salon.beauty_salon.exceptions.InvalidCredentialsException;
import com.salon.beauty_salon.exceptions.InvalidRoleException;
import com.salon.beauty_salon.exceptions.ResourceNotFoundException;
import com.salon.beauty_salon.mappers.UserMapper;
import com.salon.beauty_salon.repositories.SalonServiceRepository;
import com.salon.beauty_salon.repositories.UserRepository;
import com.salon.beauty_salon.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

@ExtendWith(MockitoExtension.class)
public class UserServiceTest {

    @Mock private UserRepository userRepository;
    @Mock private UserMapper userMapper;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtService jwtService;
    @Mock private SalonServiceRepository salonServiceRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void registerUser_WhenEmailAlreadyExists_ShouldThrowException(){

        UserRegistrationRequest request = new UserRegistrationRequest();
        request.setEmail("ioana@salon.com");

        when(userRepository.existsByEmail("ioana@salon.com")).thenReturn(true);
        assertThrows(EmailAlreadyExistsException.class, ()-> {
            userService.registerUser(request);
        });

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void registerUser_WhenValidRequest_ShouldReturnResponse() {

        UserRegistrationRequest request = new UserRegistrationRequest();
        request.setEmail("test@salon.com");
        request.setPassword("Parola123!");

        User mappedUser = new User();
        mappedUser.setEmail("test@salon.com");

        User savedUser = new User();
        savedUser.setId(1L);
        savedUser.setEmail("test@salon.com");
        savedUser.setRole(Role.CLIENT);

        UserResponse expectedResponse = new UserResponse();
        expectedResponse.setEmail("test@salon.com");

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(userMapper.toEntity(request)).thenReturn(mappedUser);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(userMapper.toDto(savedUser)).thenReturn(expectedResponse);
        when(jwtService.generateToken(savedUser.getEmail())).thenReturn("mocked-jwt-token");

        UserResponse actualResponse = userService.registerUser(request);

        assertNotNull(actualResponse);
        assertEquals("mocked-jwt-token", actualResponse.getToken());

        verify(userRepository, times(1)).save(mappedUser);

        assertEquals(Role.CLIENT, mappedUser.getRole());
    }

    @Test
    void loginUser_WhenEmailNotFound_ShouldThrowInvalidCredentialsException(){

        UserLoginRequest request = new UserLoginRequest();
        request.setEmail("wrong@salon.com");
        request.setPassword("Parola123!");

        when(userRepository.findByEmail("wrong@salon.com")).thenReturn(java.util.Optional.empty());

        assertThrows(InvalidCredentialsException.class, () -> {
            userService.loginUser(request);
        });

        verify(passwordEncoder, never()).matches(anyString(), anyString());
    }

    @Test
    void loginUser_WhenPasswordIsIncorrect_ShouldThrowInvalidCredentialsException(){

        UserLoginRequest request = new UserLoginRequest();
        request.setEmail("test@salon.com");
        request.setPassword("WrongPassword!");

        User mockedUser = new User();
        mockedUser.setEmail("test@salon.com");
        mockedUser.setPassword("hashedPasswordFromDB");

        when(userRepository.findByEmail("test@salon.com")).thenReturn(java.util.Optional.of(mockedUser));
        when(passwordEncoder.matches("WrongPassword!", "hashedPasswordFromDB")).thenReturn(false);

        assertThrows(InvalidCredentialsException.class, () -> {
            userService.loginUser(request);
        });

        verify(jwtService, never()).generateToken(anyString());

    }

    @Test
    void loginUser_WhenValidCredentials_ShouldReturnResponse(){

        UserLoginRequest request = new UserLoginRequest();
        request.setEmail("test@salon.com");
        request.setPassword("ParolaCorecta123!");

        User mockedUser = new User();
        mockedUser.setEmail("test@salon.com");
        mockedUser.setPassword("hashedPasswordFromDB");

        UserResponse expectedResponse = new UserResponse();
        expectedResponse.setEmail("test@salon.com");

        when(userRepository.findByEmail("test@salon.com")).thenReturn(java.util.Optional.of(mockedUser));
        when(passwordEncoder.matches("ParolaCorecta123!", "hashedPasswordFromDB")).thenReturn(true);
        when(jwtService.generateToken("test@salon.com")).thenReturn("mocked-jwt-token");
        when(userMapper.toDto(mockedUser)).thenReturn(expectedResponse);

        UserResponse actualResponse = userService.loginUser(request);

        assertNotNull(actualResponse);
        assertEquals("mocked-jwt-token", actualResponse.getToken());

        verify(jwtService, times(1)).generateToken("test@salon.com");
        verify(userMapper, times(1)).toDto(mockedUser);
    }

    @Test
    void getProfile_WhenUserNotFound_ShouldThrowException() {
        when(userRepository.findByEmail("notfound@salon.com")).thenReturn(java.util.Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            userService.getProfile("notfound@salon.com");
        });
    }

    @Test
    void getProfile_WhenUserFound_ShouldReturnResponse() {
        User user = new User();
        user.setEmail("test@salon.com");

        UserResponse expectedResponse = new UserResponse();
        expectedResponse.setEmail("test@salon.com");

        when(userRepository.findByEmail("test@salon.com")).thenReturn(java.util.Optional.of(user));
        when(userMapper.toDto(user)).thenReturn(expectedResponse);

        UserResponse actualResponse = userService.getProfile("test@salon.com");

        assertNotNull(actualResponse);
        assertEquals("test@salon.com", actualResponse.getEmail());
    }

    @Test
    void getAllEmployees_ShouldReturnOnlyActiveEmployees() {

        User activeEmployee = new User();
        activeEmployee.setActive(true);

        User inactiveEmployee = new User();
        inactiveEmployee.setActive(false);

        when(userRepository.findByRole(Role.EMPLOYEE)).thenReturn(java.util.List.of(activeEmployee, inactiveEmployee));

        when(userMapper.toDtoList(anyList())).thenReturn(java.util.List.of(new UserResponse()));

        java.util.List<UserResponse> result = userService.getAllEmployees();

        assertNotNull(result);
        assertEquals(1, result.size(), "Should return only the active employee");
    }

    @Test
    void createEmployee_WhenEmailExists_ShouldThrowException() {
        EmployeeCreateRequest request = new EmployeeCreateRequest();
        request.setEmail("emp@salon.com");

        when(userRepository.existsByEmail("emp@salon.com")).thenReturn(true);

        assertThrows(EmailAlreadyExistsException.class, () -> {
            userService.createEmployee(request);
        });

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void createEmployee_WhenValidRequest_ShouldSaveAndReturnResponse() {

        EmployeeCreateRequest request = new EmployeeCreateRequest();
        request.setEmail("emp@salon.com");
        request.setPassword("Parola123!");
        request.setServiceIds(java.util.List.of(1L, 2L));

        User mappedEmployee = new User();
        mappedEmployee.setEmail("emp@salon.com");

        com.salon.beauty_salon.entities.SalonService salonService1 = new com.salon.beauty_salon.entities.SalonService();
        salonService1.setId(1L);

        User savedEmployee = new User();
        savedEmployee.setEmail("emp@salon.com");
        savedEmployee.setRole(Role.EMPLOYEE);

        UserResponse expectedResponse = new UserResponse();
        expectedResponse.setEmail("emp@salon.com");

        when(userRepository.existsByEmail(request.getEmail())).thenReturn(false);
        when(userMapper.toEntity(request)).thenReturn(mappedEmployee);
        when(passwordEncoder.encode(request.getPassword())).thenReturn("encodedPassword");

        when(salonServiceRepository.findAllById(request.getServiceIds())).thenReturn(java.util.List.of(salonService1));

        when(userRepository.save(any(User.class))).thenReturn(savedEmployee);
        when(userMapper.toDto(savedEmployee)).thenReturn(expectedResponse);

        UserResponse actualResponse = userService.createEmployee(request);

        assertNotNull(actualResponse);
        assertEquals(Role.EMPLOYEE, mappedEmployee.getRole(), "The role should be EMPLOYEE");
        assertNotNull(mappedEmployee.getServices(), "Services must be assigned to the entity");

        verify(userRepository, times(1)).save(mappedEmployee);
        verify(salonServiceRepository, times(1)).findAllById(request.getServiceIds());
    }

    @Test
    void updateProfile_WhenUserNotFound_ShouldThrowException() {
        UserProfileUpdateRequest request = new UserProfileUpdateRequest();

        when(userRepository.findByEmail("notfound@salon.com")).thenReturn(java.util.Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            userService.updateProfile("notfound@salon.com", request);
        });

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void updateProfile_WhenUserFound_ShouldUpdateAndReturnResponse() {

        UserProfileUpdateRequest request = new UserProfileUpdateRequest();
        request.setFirstName("Ion");
        request.setLastName("Popescu");
        request.setPhoneNumber("0712345678");

        User existingUser = new User();
        existingUser.setEmail("test@salon.com");
        existingUser.setFirstName("Vechiul");
        existingUser.setLastName("Nume");

        UserResponse expectedResponse = new UserResponse();
        expectedResponse.setFirstName("Ion");
        expectedResponse.setLastName("Popescu");

        when(userRepository.findByEmail("test@salon.com")).thenReturn(java.util.Optional.of(existingUser));
        when(userRepository.save(any(User.class))).thenReturn(existingUser);
        when(userMapper.toDto(existingUser)).thenReturn(expectedResponse);

        UserResponse actualResponse = userService.updateProfile("test@salon.com", request);

        assertNotNull(actualResponse);
        assertEquals("Ion", existingUser.getFirstName(), "First name should be updated on entity");
        assertEquals("0712345678", existingUser.getPhoneNumber(), "Phone number should be updated on entity");

        verify(userRepository, times(1)).save(existingUser);
    }

    @Test
    void changePassword_WhenUserNotFound_ShouldThrowException() {
        ChangePasswordRequest request = new ChangePasswordRequest();

        when(userRepository.findByEmail("notfound@salon.com")).thenReturn(java.util.Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            userService.changePassword("notfound@salon.com", request);
        });
    }

    @Test
    void changePassword_WhenOldPasswordIsIncorrect_ShouldThrowInvalidCredentialsException() {

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("WrongOldPassword");
        request.setNewPassword("NewPassword123!");

        User existingUser = new User();
        existingUser.setEmail("test@salon.com");
        existingUser.setPassword("hashedOldPassword");

        when(userRepository.findByEmail("test@salon.com")).thenReturn(java.util.Optional.of(existingUser));
        when(passwordEncoder.matches("WrongOldPassword", "hashedOldPassword")).thenReturn(false);

        assertThrows(InvalidCredentialsException.class, () -> {
            userService.changePassword("test@salon.com", request);
        });

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void changePassword_WhenValidRequest_ShouldUpdatePassword() {

        ChangePasswordRequest request = new ChangePasswordRequest();
        request.setOldPassword("CorrectOldPassword");
        request.setNewPassword("NewPassword123!");

        User existingUser = new User();
        existingUser.setEmail("test@salon.com");
        existingUser.setPassword("hashedOldPassword");

        when(userRepository.findByEmail("test@salon.com")).thenReturn(java.util.Optional.of(existingUser));
        when(passwordEncoder.matches("CorrectOldPassword", "hashedOldPassword")).thenReturn(true);
        when(passwordEncoder.encode("NewPassword123!")).thenReturn("hashedNEWPassword");

        userService.changePassword("test@salon.com", request);

        assertEquals("hashedNEWPassword", existingUser.getPassword(), "The password should be updated with the encoded new password");
        verify(userRepository, times(1)).save(existingUser);
    }

    @Test
    void deactivateEmployee_WhenEmployeeNotFound_ShouldThrowException() {
        when(userRepository.findById(99L)).thenReturn(java.util.Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> {
            userService.deactivateEmployee(99L);
        });
    }

    @Test
    void deactivateEmployee_WhenUserIsNotEmployee_ShouldThrowInvalidRoleException() {

        User clientUser = new User();
        clientUser.setId(1L);
        clientUser.setRole(Role.CLIENT);

        when(userRepository.findById(1L)).thenReturn(java.util.Optional.of(clientUser));

        assertThrows(InvalidRoleException.class, () -> {
            userService.deactivateEmployee(1L);
        });

        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void deactivateEmployee_WhenValidEmployee_ShouldDeactivateAndSave() {

        User employee = new User();
        employee.setId(1L);
        employee.setRole(Role.EMPLOYEE);
        employee.setActive(true);

        when(userRepository.findById(1L)).thenReturn(java.util.Optional.of(employee));

        userService.deactivateEmployee(1L);

        assertFalse(employee.isActive(), "The employee should be marked as inactive");
        verify(userRepository, times(1)).save(employee);
    }
}
