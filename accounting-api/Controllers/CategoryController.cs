namespace AccountingApi.Controllers;

using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using AccountingApi.Data;
using AccountingApi.Models;
using AccountingApi.DTOs;
using System.Security.Claims;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CategoryController : ControllerBase
{
    private readonly AppDbContext _context;

    public CategoryController(AppDbContext context)
    {
        _context = context;
    }
    var userId = GetUserId();
    private int GetUserId() => int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "0");

    [HttpGet]
    public async Task<ActionResult<IEnumerable<CategoryDTO.CategoryResponseDTO>>> GetCategories()
    {
        var userId = GetUserId();
        var categories = await _context.Categories
            .Where(c => c.UserId == GetUserId())
            .Select(c => new CategoryDTO.CategoryResponseDTO(
                c.Id,
                c.Name,
                c.Description,
                c.Icon,
                c.Color,
                c.Type
            ))
            .ToListAsync();

        return Ok(categories);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CategoryDTO.CategoryResponseDTO>> GetCategory(int id)
    {
        var category = await _context.Categories
            .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

        if (category == null)
        {
            return NotFound();
        }

        var categoryDto = new CategoryDTO.CategoryResponseDTO(
            category.Id,
            category.Name,
            category.Description,
            category.Icon,
            category.Color,
            category.Type
        );

        return Ok(categoryDto);
    }

    [HttpPost]
    public async Task<ActionResult<CategoryDTO.CategoryResponseDTO>> CreateCategory(CategoryDTO.CategoryCreateDTO categoryDto)
    {
        var category = new Category
        {
            Name = categoryDto.Name,
            Description = categoryDto.Description,
            Icon = categoryDto.Icon,
            Color = categoryDto.Color,
            Type = categoryDto.Type,
            UserId = GetUserId()
        };

        _context.Categories.Add(category);
        await _context.SaveChangesAsync();

        var createdCategoryDto = new CategoryDTO.CategoryResponseDTO(
            category.Id,
            category.Name,
            category.Description,
            category.Icon,
            category.Color,
            category.Type
        );

        return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, createdCategoryDto);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateCategory(int id, CategoryDTO.CategoryUpdateDTO categoryDto)
    {   
        var userId = GetUserId();
        if (id != categoryDto.Id)
        {
            return BadRequest();
        }

        var category = await _context.Categories.FirstOrDefaultAsync((c => c.Id == id && c.UserId == userId));
        if (category == null)
        {
            return NotFound();
        }

        category.Name = categoryDto.Name;
        category.Description = categoryDto.Description;
        category.Icon = categoryDto.Icon;
        category.Color = categoryDto.Color;
        category.Type = categoryDto.Type;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteCategory(int id)
    {
        var UserId = GetUserId();
        var category = await _context.Categories.FirstOrDefaultAsync(c => c.Id == id && UserId ==userId);
       
        if (category == null)
        {
            return NotFound("Kategory couldn't be found or you do not have permission to delete it.");
        }

        _context.Categories.Remove(category);
        await _context.SaveChangesAsync();

        return NoContent();
    }
}