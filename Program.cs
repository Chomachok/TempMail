var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllersWithViews();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();

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