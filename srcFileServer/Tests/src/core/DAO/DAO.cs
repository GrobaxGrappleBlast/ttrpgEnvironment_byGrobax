using System.Text.Json;
using Microsoft.Extensions.DependencyInjection;
using srcServer.core.fileHandler;
namespace tests;
 
[TestClass]
public class DAOTests
{
	[TestMethod]
	public async Task getAllSystems (){ 
		ServiceProvider s = TestHelper.get();
		DAO dao = s.GetService<DAO>(); //new DAO();
		var result = await dao.LoadAllAvailableSystems();
	} 
}