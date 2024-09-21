using srcServer.core.fileHandler;

  
var builder = WebApplication.CreateBuilder( args );
builder.Services.AddControllers();
IConfiguration configuration = new ConfigurationBuilder()
		.SetBasePath(AppContext.BaseDirectory)  // Set the base path where the appsettings.json file is located
		.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)  // Specify appsettings.json
		.Build();
builder.Services.AddSingleton<IConfiguration>(configuration);
builder.Services.AddSingleton<DAO, DAO>();  // Custom service

var app = builder.Build(); 
app.MapControllers();
app.MapGet("/", () => "Welcome to the Web API, for the file storage");
app.Run();
