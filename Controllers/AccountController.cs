using Microsoft.AspNetCore.Mvc;
namespace TempMail.Controllers;

public class AccountController : Controller
{
    public IActionResult Login()
    {
        return View();
    }

    public IActionResult Register()
    {
        return View();
    }
}
//zalupa bomja