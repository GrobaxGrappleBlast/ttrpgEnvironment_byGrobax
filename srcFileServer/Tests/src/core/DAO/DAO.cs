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


	[TestMethod]
	public async Task CRUDEDefinition (){ 
		ServiceProvider s = TestHelper.get();
		DAO dao = s.GetService<DAO>(); 

		string sysName = "System Test";
		string sysAuth = "Grobax";

		var sys = await dao.createSystem(sysName,sysAuth);
		Assert.AreEqual(sys.name, sysName);
		Assert.AreEqual(sys.author, sysAuth);
		Assert.AreNotEqual(sys.version, "");
		Assert.AreNotEqual(sys.version, null); 

		sysName = "System22222 Test";
		sysAuth = "Grobax22222";
		sys.name = sysName;
		sys.author = sysAuth;
		sys = await dao.updateSystem(sys);
		Assert.AreEqual(sys.name, sysName);
		Assert.AreEqual(sys.author, sysAuth);
		Assert.AreNotEqual(sys.version, "");
		Assert.AreNotEqual(sys.version, null); 

		bool deletedS = await dao.deleteSystem(sys);
		Assert.AreEqual(deletedS,true);
		 
		var allSystems = await dao.LoadAllAvailableSystems();
		var codes = allSystems.Select( p => p.code );
		var existsStil = codes.Contains(sys.code);

		Assert.IsFalse(existsStil);
	} 
}