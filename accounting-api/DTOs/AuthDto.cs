namespace AccountingApi.DTOs;

public record RegisterDto(string Name, string Email, string Password);
public record LoginDto(string Email, string Password);
public record AuthResponseDto(string Token, string Name, string Email);
public record UserDto(int Id, string Name, string Email, DateTime CreatedAt);
