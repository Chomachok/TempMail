using TempMail.Models;

namespace TempMail.Services;

public class EmailGenerator
{
    private readonly Random _random = new();

    public Email GenerateEmail(Guid sessionId)
    {
        var domains = new[] { "tempmail.com", "spam4.me", "mailtemp.net" };
        var randomId = Guid.NewGuid().ToString("N")[..8];
        var randomDomainId = _random.Next(domains.Length);
        var email = new Email
        {
            Address = $"{randomId}@{domains[randomDomainId]}",
            CreatedAt = DateTime.Now,
            DiesAt = DateTime.Now + TimeSpan.FromMinutes(10),
            Alive = true,
            User = new User
            {
                SessionId = sessionId,
                CreationTime = DateTime.Now
            }
        };
        
        return email;
    }
}