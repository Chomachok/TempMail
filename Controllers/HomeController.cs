using Microsoft.AspNetCore.Mvc;
using TempMail.Services;

namespace TempMail.Controllers;

public class HomeController(ILogger<HomeController> logger) : Controller
{
    private readonly EmailGenerator _emailGenerator = new();

    public IActionResult Index()
    {
        return View();
    }
    
    [HttpPost]
    public IActionResult GenerateEmail()
    {
        var email = _emailGenerator.GenerateEmail();
        logger.LogInformation("Created email {Email}", email);
        var emailGenerated = true;
        ViewData["Email"] = email;
        ViewData["EmailGenerated"] = emailGenerated;
        
        return View("Index");
    }
    
    public IActionResult Contacts() => View();
    public IActionResult HowItWorks() => View();
    public IActionResult Features() => View();
}