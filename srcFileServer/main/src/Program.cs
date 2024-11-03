using Microsoft.EntityFrameworkCore;

using srcServer.core.database;
using srcServer.core.fileHandler;
using srcServer.repositories;


var builder = WebApplication.CreateBuilder( args );

IConfiguration configuration = new ConfigurationBuilder()
		.SetBasePath(AppContext.BaseDirectory)  // Set the base path where the appsettings.json file is located
		.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)  // Specify appsettings.json
		.Build();

builder.Services.AddSingleton<IConfiguration>(configuration); 
builder.Services.AddScoped<TemplateRepository,TemplateRepository>();
builder.Services.AddScoped<SystemsRepository,SystemsRepository>();
builder.Services.AddControllers( 
	
 );


builder.Services.AddCors(options =>
{
	options.AddPolicy("AllowFrontendDev",
		builder => builder
			//.AllowAnyOrigin()
			.WithOrigins(
				"http://localhost:5500",
				"http://localhost:5171",
				"http://localhost:5172",
				"http://localhost:5173",
				"http://localhost:5174",
				"http://localhost:5175",
				"http://localhost:5176"
			)  // Frontend origin with port
			.AllowAnyMethod()
			.AllowAnyHeader()
			.AllowCredentials());
		
});


var _connectionString = configuration.GetConnectionString("mariaDBDocker");

// add Entity Framework
builder.Services.AddDbContext<DatabaseContext>(options =>
    options.UseMySql(_connectionString,
        new MySqlServerVersion(new Version(10, 5, 9)))); 

builder.Services.AddDbContext<DatabaseContext>(options =>
    options.UseMySql(_connectionString,
        new MySqlServerVersion(new Version(10, 5, 9))));

var app = builder.Build(); 
app.UseRouting();
app.UseCors("AllowFrontendDev");  
app.UseAuthorization();
app.MapControllers();
app.MapGet("/", () => "Welcome to the Web API, for the file storage");
app.Run();
