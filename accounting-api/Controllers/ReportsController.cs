using System.Security.Claims;
using AccountingApi.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AccountingApi.Controllers;

[ApiController]
[Route("api/reports")]
[Authorize]
public class ReportsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ReportsController(AppDbContext db) => _db = db;

    private int GetUserId() =>
        int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("summary")]
    public async Task<IActionResult> GetSummary()
    {
        var userId = GetUserId();

        var totalIncome = await _db.Incomes
            .Where(i => i.UserId == userId)
            .SumAsync(i => (decimal?)i.Amount) ?? 0;

        var totalExpense = await _db.Expenses
            .Where(e => e.UserId == userId)
            .SumAsync(e => (decimal?)e.Amount) ?? 0;

        var incomeCount = await _db.Incomes.CountAsync(i => i.UserId == userId);
        var expenseCount = await _db.Expenses.CountAsync(e => e.UserId == userId);

        return Ok(new
        {
            TotalIncome = totalIncome,
            TotalExpense = totalExpense,
            NetBalance = totalIncome - totalExpense,
            IncomeCount = incomeCount,
            ExpenseCount = expenseCount,
        });
    }
}
