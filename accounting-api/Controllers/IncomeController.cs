using System.Security.Claims;
using AccountingApi.Data;
using AccountingApi.DTOs;
using AccountingApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AccountingApi.Controllers;

[ApiController]
[Route("api/income")]
[Authorize]
public class IncomeController : ControllerBase
{
    private readonly AppDbContext _db;

    public IncomeController(AppDbContext db) => _db = db;

    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetUserId();
        var incomes = await _db.Incomes
            .Where(i => i.UserId == userId)
            .OrderByDescending(i => i.Date)
            .Select(i => new IncomeResponseDto(i.Id, i.Amount, i.Description, i.Category, i.Date, i.CreatedAt))
            .ToListAsync();

        return Ok(incomes);
    }

    [HttpPost]
    public async Task<IActionResult> Create(IncomeCreateDto dto)
    {
        var income = new Income
        {
            UserId = GetUserId(),
            Amount = dto.Amount,
            Description = dto.Description,
            Category = dto.Category,
            Date = dto.Date,
        };

        _db.Incomes.Add(income);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new IncomeResponseDto(
            income.Id, income.Amount, income.Description, income.Category, income.Date, income.CreatedAt));
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, IncomeUpdateDto dto)
    {
        var income = await _db.Incomes.FirstOrDefaultAsync(i => i.Id == id && i.UserId == GetUserId());
        if (income is null) return NotFound();

        income.Amount = dto.Amount;
        income.Description = dto.Description;
        income.Category = dto.Category;
        income.Date = dto.Date;

        await _db.SaveChangesAsync();
        return Ok(new IncomeResponseDto(income.Id, income.Amount, income.Description, income.Category, income.Date, income.CreatedAt));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var income = await _db.Incomes.FirstOrDefaultAsync(i => i.Id == id && i.UserId == GetUserId());
        if (income is null) return NotFound();

        _db.Incomes.Remove(income);
        await _db.SaveChangesAsync();
        return NoContent();
    }
}
