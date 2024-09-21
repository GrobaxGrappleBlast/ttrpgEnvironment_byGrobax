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
		IConfiguration configuration = new ConfigurationBuilder().Build();
		services.AddSingleton<IConfiguration>(configuration);
		services.AddSingleton<DAO, DAO>();  
		services.AddControllers();  

		// Build the service provider (DI container) and return it
		_serviceProvider = services.BuildServiceProvider();
		return _serviceProvider;
	} 
 
}
