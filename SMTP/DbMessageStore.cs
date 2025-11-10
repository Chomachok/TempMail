using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using MimeKit;
using SmtpServer;
using SmtpServer.Protocol;
using SmtpServer.Storage;
using System.Buffers;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using TempMail.Data;        
using TempMail.Models;      

namespace TempMail.Smtp
{
    public class DbMessageStore : MessageStore
    {
        private readonly IServiceScopeFactory _scopeFactory;
        private readonly ILogger<DbMessageStore> _logger;

        public DbMessageStore(IServiceScopeFactory scopeFactory, ILogger<DbMessageStore> logger)
        {
            _scopeFactory = scopeFactory;
            _logger = logger;
        }

        public override async Task<SmtpResponse> SaveAsync(
            ISessionContext context,
            IMessageTransaction transaction,
            ReadOnlySequence<byte> buffer,
            CancellationToken cancellationToken)
        {
            using var scope = _scopeFactory.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();

            try
            {
                var raw = buffer.ToArray();
                MimeMessage message;
                using (var ms = new MemoryStream(raw))
                {
                    message = MimeMessage.Load(ms);
                }

                var toAddress = message.To.Mailboxes.FirstOrDefault()?.Address
                             ?? transaction.To.FirstOrDefault()?.ToString()
                             ?? string.Empty;

                var fromAddress = message.From.Mailboxes.FirstOrDefault()?.Address
                               ?? transaction.From.ToString();

                _logger.LogInformation("Processing email from {From} to {To}", fromAddress, toAddress);

                if (string.IsNullOrWhiteSpace(toAddress))
                {
                    _logger.LogWarning("Empty recipient address");
                    return SmtpResponse.Ok;
                }

                var email = await db.Emails
                    .FirstOrDefaultAsync(e => e.Address == toAddress && e.Alive, cancellationToken);

                if (email == null)
                {
                    _logger.LogInformation("Recipient not found: {ToAddress}", toAddress);
                    return SmtpResponse.Ok;
                }

                var letter = new Letter
                {
                    MailId = email.EmailId,
                    FromAddress = fromAddress,
                    Body = message.TextBody ?? string.Empty,
                    BodyHtml = message.HtmlBody ?? string.Empty,
                    Time = DateTime.UtcNow
                };

                db.Letters.Add(letter);
                await db.SaveChangesAsync(cancellationToken);

                _logger.LogInformation("Email saved successfully for {ToAddress}", toAddress);
                return SmtpResponse.Ok;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving email to database");
                return SmtpResponse.TransactionFailed;
            }
        }
    }
}
