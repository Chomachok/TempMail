namespace TempMail.Services;

public class EmailGenerator
{
    private readonly Random _random = new();

    public string GenerateEmail()
    {
        var domains = new[] { "tempmail.com", "spam4.me", "mailtemp.net" };
        var randomId = Guid.NewGuid().ToString("N").Substring(0, 8);
        var randomDomainId = _random.Next(domains.Length);

        return $"{randomId}@{domains[randomDomainId]}";
    }
}