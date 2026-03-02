using System.Security.Claims;
using AccountingApi.Data;
using AccountingApi.DTOs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AccountingApi.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;

    public UsersController(AppDbContext db) => _db = db;

    // GET api/users
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _db.Users
            .OrderBy(u => u.Id)
            .Select(u => new UserDto(u.Id, u.Name, u.Email, u.CreatedAt))
            .ToListAsync();

        return Ok(users);
    }

    // GET api/users/{id}
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(int id)
    {
        var user = await _db.Users
            .Where(u => u.Id == id)
            .Select(u => new UserDto(u.Id, u.Name, u.Email, u.CreatedAt))
            .FirstOrDefaultAsync();

        if (user is null) return NotFound();
        return Ok(user);
    }

    // GET api/users/dev-all  ⚠️ Sadece geliştirme amaçlı — prod'da kaldırın!
    [HttpGet("dev-all")]
    [AllowAnonymous]
    public async Task<IActionResult> DevGetAll()
    {
        var users = await _db.Users
            .OrderBy(u => u.Id)
            .ToListAsync();

        return Ok(users);
    }
}
