namespace AccountingApi.DTOs;

public record ExpenseCreateDto(decimal Amount, string Description, string Category, DateTime Date);

public record ExpenseResponseDto(int Id, decimal Amount, string Description, string Category, DateTime Date, DateTime CreatedAt);
