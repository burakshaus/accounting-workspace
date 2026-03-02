namespace AccountingApi.DTOs;

public record IncomeCreateDto(decimal Amount, string Description, string Category, DateTime Date);
public record IncomeUpdateDto(decimal Amount, string Description, string Category, DateTime Date);
public record IncomeResponseDto(int Id, decimal Amount, string Description, string Category, DateTime Date, DateTime CreatedAt);
