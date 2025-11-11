using TempMail.Data;
using TempMail.Models;

namespace TempMail.Services;

public class DbManagerService
{
    private static readonly AppDbContext Context = null!;
    
    public async Task AddUserAsync(Guid sessionId, Email email)
    {
        var user = new User
        {
            SessionId = sessionId,
            CreationTime = DateTime.UtcNow,
            Email = email
        };

        Context.Users.Add(user);

        await Context.SaveChangesAsync();
    }

    public async Task AddEmailAsync(Email email)
    {
        Context.Emails.Add(email);

        await Context.SaveChangesAsync();
    }
}