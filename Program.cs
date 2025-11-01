using TempMail.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();
builder.Services.AddSession(options =>
{
    options.IdleTimeout = TimeSpan.FromMinutes(30);
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
    options.Cookie.Name = ".TempMail.Session";
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseSession();
app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();

var reciver = new EmailReceiver();
reciver.ReciveEmails();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");
app.MapControllerRoute(
    name: "contacts",
    pattern: "{controller=Home}/{action=Contacts}");
app.MapControllerRoute(
    name: "login",
    pattern: "{controller=Account}/{action=Login}");
app.MapControllerRoute(
    name: "register",
    pattern: "{controller=Account}/{action=Register}");

app.Run();