using Microsoft.AspNetCore.Mvc;
using TempMail.Services;
using TempMail.Models;

namespace TempMail.Controllers;

public class HomeController : Controller
{
    private const string SessionEmailKey = "UserEmail";
    private const string SessionEmailCreatedKey = "EmailCreated";
    private readonly EmailGenerator _emailGenerator = new();
    private Email _email = null!;
    private readonly DbManagerService _dbManager = null!;
    private Guid _sessionId;

    public IActionResult Index()
    {
        var emailCreated = HttpContext.Session.GetString(SessionEmailCreatedKey) == "true";

        if (emailCreated)
        {
            ViewData["Email"] = HttpContext.Session.GetString(SessionEmailKey);
            ViewData["ShowTimer"] = true;
            _sessionId = Guid.Parse(HttpContext.Session.Id);
            _dbManager.AddUserAsync(_sessionId, _email);
            _dbManager.AddEmailAsync(_email);
        }
        else
        {
            ViewData["Email"] = "";
            ViewData["ShowTimer"] = false;
        }

        return View();
    }
    
    [HttpPost]
    public IActionResult GenerateEmail()
    {
        _email = _emailGenerator.GenerateEmail(_sessionId);
        //logger.LogInformation("Created email {Email}", _email);
        
        HttpContext.Session.SetString(SessionEmailKey, _email.Address);
        HttpContext.Session.SetString(SessionEmailCreatedKey, "true");
        
        return RedirectToAction("Index");
    }

    [HttpPost]
    public IActionResult ResetEmail()
    {
        HttpContext.Session.Remove(SessionEmailKey);
        HttpContext.Session.Remove(SessionEmailCreatedKey);

        return RedirectToAction("Index");
    }

    [HttpPost]
    public IActionResult RefreshEmail()
    {
        var email = _emailGenerator.GenerateEmail(_sessionId);
        
        HttpContext.Session.SetString(SessionEmailKey, _email.Address);
        HttpContext.Session.SetString(SessionEmailCreatedKey, "true");

        return RedirectToAction("Index");
    }
    
    public IActionResult Contacts() => View();
    public IActionResult HowItWorks() => View();
    public IActionResult Features() => View();
}