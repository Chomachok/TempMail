using MailKit;
using MailKit.Net.Imap;
using MailKit.Search;
using MimeKit;
using TempMail.Controllers;

namespace TempMail.Services;

public class EmailReceiver
{
    public static void ReceiveEmails()
    {
        using (var client = new ImapClient())
        {
            // Подключение к серверу
            client.Connect("localhost", 5136, true);
            var controller = new HomeController();
            var email = controller.GetEmail();
            
            // Аутентификация
            client.Authenticate(email, "1234");
            
            // Выбор папки "Входящие"
            client.Inbox.Open(FolderAccess.ReadOnly);
            
            // Получение списка писем
            var uids = client.Inbox.Search(SearchQuery.All);
            
            foreach (var uid in uids)
            {
                var message = client.Inbox.GetMessage(uid);
                
                Console.WriteLine($"От: {message.From}");
                Console.WriteLine($"Тема: {message.Subject}");
                Console.WriteLine($"Дата: {message.Date}");
                Console.WriteLine($"Текст: {message.TextBody}");
                Console.WriteLine("-----------------------------------");
            }
            
            client.Disconnect(true);
        }
    }
}