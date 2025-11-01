using Microsoft.AspNetCore.Mvc;
using TempMail.Services;

namespace TempMail.Controllers;

public class HomeController : Controller
{
    private const string SessionEmailKey = "UserEmail";
    private const string SessionEmailCreatedKey = "EmailCreated";
    private readonly TimeSpan _emailLifeTime = TimeSpan.FromMinutes(10);
    private readonly EmailGenerator _emailGenerator = new();
    private string? _email;

    public IActionResult Index()
    {
        var emailCreated = HttpContext.Session.GetString(SessionEmailCreatedKey) == "true";

        if (emailCreated)
        {
            ViewData["Email"] = HttpContext.Session.GetString(SessionEmailKey);
            ViewData["ShowTimer"] = true;
        }
        else
        {
            ViewData["Email"] = "";
            ViewData["ShowTimer"] = false;
        }

        return View();
    }

    [NonAction]
    public string? GetEmail() => _email;
    
    [HttpPost]
    public IActionResult GenerateEmail()
    {
        _email = _emailGenerator.GenerateEmail();
        // logger.LogInformation("Created email {Email}", _email);
        
        HttpContext.Session.SetString(SessionEmailKey, _email);
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
        var email = _emailGenerator.GenerateEmail();
        
        HttpContext.Session.SetString(SessionEmailKey, email);
        HttpContext.Session.SetString(SessionEmailCreatedKey, "true");

        return RedirectToAction("Index");
    }
    
    public IActionResult Contacts() => View();
    public IActionResult HowItWorks() => View();
    public IActionResult Features() => View();
}