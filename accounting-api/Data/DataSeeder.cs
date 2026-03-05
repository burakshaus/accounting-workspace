using AccountingApi.Models;
using Microsoft.EntityFrameworkCore;

namespace AccountingApi.Data;

public static class DataSeeder
{
    public static void SeedData(this IApplicationBuilder app)
    {
        using var scope = app.ApplicationServices.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Ensure database is created and apply migrations if necessary
        context.Database.EnsureCreated();

        // Get existing user or create one
        var user = context.Users.FirstOrDefault();
        if (user == null)
        {
            user = new User
            {
                Name = "Test User",
                Email = "dev@local.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("123456")
            };
            context.Users.Add(user);
            context.SaveChanges();
        }

        // Check if incomes exist for this user, if not, create them
        if (!context.Incomes.Any(i => i.UserId == user.Id))
        {
            var incomes = new List<Income>
            {
                new Income { UserId = user.Id, Amount = 5500, Category = "Salary", Description = "March Salary", Date = DateTime.UtcNow.AddDays(-15) },
                new Income { UserId = user.Id, Amount = 1200, Category = "Freelance", Description = "Mobile App UI Design", Date = DateTime.UtcNow.AddDays(-8) },
                new Income { UserId = user.Id, Amount = 400, Category = "Investment", Description = "Stock Dividends", Date = DateTime.UtcNow.AddDays(-2) },
                new Income { UserId = user.Id, Amount = 800, Category = "Other", Description = "Sold Old Laptop", Date = DateTime.UtcNow.AddDays(-1) }
            };
            context.Incomes.AddRange(incomes);
        }

        // Check if expenses exist for this user, if not, create them
        if (!context.Expenses.Any(e => e.UserId == user.Id))
        {
            var expenses = new List<Expense>
            {
                new Expense { UserId = user.Id, Amount = 1800, Category = "Rent", Description = "Office Rent", Date = DateTime.UtcNow.AddDays(-14) },
                new Expense { UserId = user.Id, Amount = 350, Category = "Utilities", Description = "Electricity & Water", Date = DateTime.UtcNow.AddDays(-12) },
                new Expense { UserId = user.Id, Amount = 120, Category = "Transport", Description = "Fuel", Date = DateTime.UtcNow.AddDays(-10) },
                new Expense { UserId = user.Id, Amount = 450, Category = "Food", Description = "Monthly Groceries", Date = DateTime.UtcNow.AddDays(-5) },
                new Expense { UserId = user.Id, Amount = 200, Category = "Entertainment", Description = "Team Dinner", Date = DateTime.UtcNow.AddDays(-3) },
                new Expense { UserId = user.Id, Amount = 90, Category = "Other", Description = "Software Subscriptions", Date = DateTime.UtcNow.AddDays(-1) }
            };
            context.Expenses.AddRange(expenses);
        }

        context.SaveChanges();
    }
}
