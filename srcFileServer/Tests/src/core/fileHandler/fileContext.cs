using System.Text.Json;
using srcServer.core.fileHandler;
namespace tests;
 
[TestClass]
public class fileContextTests
{

	public static string TestFolder = "TestFolder";

	[TestMethod]
	public async Task getAllSystems (){
		var systems = await FileContext.getAllSystems();
		Assert.IsTrue( systems.Length > 0 );
		for (int i = 0; i < systems.Length ; i++)
		{	
			try {
				var json = systems[i];
				JsonSerializer.Deserialize<SystemPreview>(json);
			}catch( Exception e){
				Assert.IsTrue(false);
			}
		}
		Assert.IsTrue(true);
	}

			
}
 