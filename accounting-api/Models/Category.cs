namespace AccountingApi.Models;

public enum CategoryType{Income,Expense}

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; }
    public string Icon { get; set; } = "apps-outline";
    public string Color { get; set; } = "#1E3A5F";
    public CategoryType Type { get; set; }
    public int UserId {get; set;}
    public User User {get; set;} = null;
}

