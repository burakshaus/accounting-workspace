namespace AccountingApi.DTOs;

using AccountingApi.Models;

public class CategoryDTO
{
    public record CategoryResponseDTO(int Id, string Name, string Description, string Icon, string Color, CategoryType Type);
    public record CategoryCreateDTO(string Name, string Description, string Icon, string Color, CategoryType Type);
    public record CategoryUpdateDTO(int Id, string Name, string Description, string Icon, string Color, CategoryType Type);
}