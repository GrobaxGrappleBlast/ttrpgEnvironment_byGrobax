using srcServer.core.fileHandler;

  
var builder = WebApplication.CreateBuilder( args );
builder.Services.AddControllers();
IConfiguration configuration = new ConfigurationBuilder().Build();
builder.Services.AddSingleton<IConfiguration>(configuration);
builder.Services.AddSingleton<DAO, DAO>();  // Custom service

var app = builder.Build(); 
app.MapControllers();
app.MapGet("/", () => "Welcome to the Web API, for the file storage");
app.Run();
