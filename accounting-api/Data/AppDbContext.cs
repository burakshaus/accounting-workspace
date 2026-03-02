using AccountingApi.Models;
using Microsoft.EntityFrameworkCore;

namespace AccountingApi.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Income> Incomes => Set<Income>();
    public DbSet<Expense> Expenses => Set<Expense>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();

        modelBuilder.Entity<Income>()
            .HasOne(i => i.User)
            .WithMany(u => u.Incomes)
            .HasForeignKey(i => i.UserId);

        modelBuilder.Entity<Expense>()
            .HasOne(e => e.User)
            .WithMany(u => u.Expenses)
            .HasForeignKey(e => e.UserId);

        modelBuilder.Entity<Income>()
            .Property(i => i.Amount)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<Expense>()
            .Property(e => e.Amount)
            .HasColumnType("decimal(18,2)");
    }
}
