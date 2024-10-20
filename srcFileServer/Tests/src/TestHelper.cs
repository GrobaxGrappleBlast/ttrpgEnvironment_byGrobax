using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using System; 
using srcServer.core.fileHandler;

public class TestHelper
{	 
	private static ServiceProvider _serviceProvider; 
	 
	public static ServiceProvider get(){

		if (_serviceProvider != null){
			return _serviceProvider;
		}

		// Create a new service collection for dependency injection (like in your Main project)
		var services = new ServiceCollection();


		string path = AppContext.BaseDirectory;
		string appsettings = FileHandler.getSystemsPath();//"appsettings.json");

		
		IConfiguration configuration = new ConfigurationBuilder()
			//.SetBasePath(appsettings)  // Set the base path where the appsettings.json file is located
			.AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)  // Specify appsettings.json
			.Build();

		services.AddSingleton<IConfiguration>(configuration);
		services.AddControllers();  

		// Build the service provider (DI container) and return it
		_serviceProvider = services.BuildServiceProvider();
		return _serviceProvider;
	} 
 
}
