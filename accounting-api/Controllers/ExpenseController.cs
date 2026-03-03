using System.Security.Claims;
using AccountingApi.Data;
using AccountingApi.DTOs;
using AccountingApi.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AccountingApi.Controllers;

[ApiController]
[Route("api/expense")]
[Authorize]
public class ExpenseController : ControllerBase
{
    private readonly AppDbContext _db;

    public ExpenseController(AppDbContext db) => _db = db;

    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var userId = GetUserId();
        var expenses = await _db.Expenses
            .Where(e => e.UserId == userId)
            .OrderByDescending(e => e.Date)
            .Select(e => new ExpenseResponseDto(e.Id, e.Amount, e.Description, e.Category, e.Date, e.CreatedAt))
            .ToListAsync();

        return Ok(expenses);
    }

    [HttpPost]
    public async Task<IActionResult> Create(ExpenseCreateDto dto)
    {
        var expense = new Expense
        {
            UserId = GetUserId(),
            Amount = dto.Amount,
            Description = dto.Description,
            Category = dto.Category,
            Date = dto.Date,
        };

        _db.Expenses.Add(expense);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetAll), new ExpenseResponseDto(
            expense.Id, expense.Amount, expense.Description, expense.Category, expense.Date, expense.CreatedAt));
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var expense = await _db.Expenses.FirstOrDefaultAsync(e => e.Id == id && e.UserId == GetUserId());
        if (expense is null) return NotFound();

        _db.Expenses.Remove(expense);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, ExpenseUpdateDto dto)
    {
        var expense = await _db.Expenses.FirstOrDefaultAsync(e => e.Id == id && e.UserId == GetUserId());
        if (expense is null) return NotFound();

        expense.Amount = dto.Amount;
        expense.Description = dto.Description;
        expense.Category = dto.Category;
        expense.Date = dto.Date;

        await _db.SaveChangesAsync();
        return Ok(new ExpenseResponseDto(expense.Id, expense.Amount, expense.Description, expense.Category, expense.Date, expense.CreatedAt));
    }
}
