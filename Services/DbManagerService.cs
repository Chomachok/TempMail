using TempMail.Data;
using TempMail.Models;

namespace TempMail.Services;

public class DbManagerService(AppDbContext context)
{
    
    public async Task AddUserAsync(Guid sessionId, Email email)
    {
        var user = new User
        {
            SessionId = sessionId,
            CreationTime = DateTime.UtcNow,
            Email = email
        };

        context.Users.Add(user);

        await context.SaveChangesAsync();
    }

    public async Task AddEmailAsync(Email email)
    {
        context.Emails.Add(email);

        await context.SaveChangesAsync();
    }
}