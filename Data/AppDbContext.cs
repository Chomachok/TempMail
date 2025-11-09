using Microsoft.EntityFrameworkCore;
using TempMail.Models;

namespace TempMail.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }

    public DbSet<User> Users { get; set; }
    public DbSet<Email> Emails { get; set; }
    public DbSet<Letter> Letters { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // === USER ===
        modelBuilder.Entity<User>()
            .HasIndex(u => u.SessionId)
            .IsUnique();

        // === EMAIL ===
        modelBuilder.Entity<Email>()
            .HasOne(e => e.User)
            .WithOne(u => u.Email)
            .HasForeignKey<Email>(e => e.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        modelBuilder.Entity<Email>()
            .HasIndex(e => e.Address)
            .IsUnique();

        // === LETTER ===
        modelBuilder.Entity<Letter>()
            .HasOne(l => l.Email)
            .WithMany(e => e.Letters)
            .HasForeignKey(l => l.MailId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}
