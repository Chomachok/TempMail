using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using SmtpServer;
using SmtpServer.ComponentModel;
using SmtpServer.Protocol;
using SmtpServer.Storage;
using System;
using System.Threading;
using System.Threading.Tasks;

namespace TempMail.Smtp
{
    public class SmtpHostedService : IHostedService
    {
        private readonly SmtpServer.SmtpServer _server;
        private readonly ILogger<SmtpHostedService> _logger;

        public SmtpHostedService(IServiceProvider serviceProvider, ILogger<SmtpHostedService> logger, IConfiguration configuration)
        {
            _logger = logger;
            var port = configuration.GetValue<int>("Smtp:Port", 1025);
            var host = configuration.GetValue<string>("Smtp:Host", "localhost");


            var options = new SmtpServerOptionsBuilder()
                .ServerName(host)
                .Port(port)
                .Build();

            var provider = new SmtpServer.ComponentModel.ServiceProvider();
            var scopeFactory = serviceProvider.GetRequiredService<IServiceScopeFactory>();

            provider.Add(new DbMessageStore(
                scopeFactory,
                serviceProvider.GetRequiredService<ILogger<DbMessageStore>>()));

            _server = new SmtpServer.SmtpServer(options, provider);
        }

        private Task? _serverTask;
        public Task StartAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Starting SMTP server");
            try
            {
                _serverTask = _server.StartAsync(cancellationToken);
                _logger.LogInformation("SMTP server started successfully");
                return Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to start SMTP server");
                throw;
            }
        }

        public async Task StopAsync(CancellationToken cancellationToken)
        {
            _logger.LogInformation("Stopping SMTP server...");
            _server.Shutdown();
            if (_serverTask != null)
                await _serverTask; 
            _logger.LogInformation("SMTP server stopped");
        }
    }
}
