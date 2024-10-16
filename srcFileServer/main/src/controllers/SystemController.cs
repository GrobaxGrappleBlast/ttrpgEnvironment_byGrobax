using System;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using srcServer.core.fileHandler;

namespace srcServer.Controllers
{
	[ApiController]
	[Route("api")]
	public class SystemDefinitions : ControllerBase
	{
		private DAO _dao;
		public SystemDefinitions( DAO dao){
			_dao = dao;
		}

		[HttpGet]
		[Route("system")]
		public async Task<IActionResult> GetAllSystems()
		{

			try {
				var systems = await _dao.LoadAllAvailableSystems();
				return Ok(systems);
			} 	
			catch(TTRPGSystemException e){
				return BadRequest(e.Message );
			}
			catch(Exception e){
				Logger.LogError(e);
				return BadRequest("Something went wrong");
			}
		}

		[HttpPut]
		[Route("system")]
		public async Task<IActionResult> EditSystem( SystemDefinitionDTO update )
		{
			try {
				var systems = await _dao.updateSystem(update);
				return Ok( systems );
			} 
			catch(TTRPGSystemException e){
				return BadRequest(e.Message );
			}
			catch(Exception e){
				Logger.LogError(e, $"input: { JsonSerializer.Serialize(update) } " );
				return BadRequest("Something went wrong");
			}
		}

		[HttpDelete]
		[Route("system")]
		public async Task<IActionResult> DeleteSystem( SystemDefinitionDTO system )
		{
			try {
				var systems = await _dao.deleteSystem(system);
				return Ok( systems );
			} 	
			catch(TTRPGSystemException e){
				return BadRequest(e.Message );
			}
			catch(Exception e){
				Logger.LogError(e, $"input: { JsonSerializer.Serialize(system) } " );
				return BadRequest("Something went wrong");
			}
		}

		[HttpPut]
		[Route("system/copy")]
		public async Task<IActionResult> CopySystem( SystemDefinitionDTO system )
		{
			try {
				var systems = await _dao.copySystem(system);
				return Ok( systems );
			} 	
			catch(TTRPGSystemException e){
				return BadRequest(e.Message );
			}
			catch(Exception e){
				Logger.LogError(e, $"input: { JsonSerializer.Serialize(system) } " );
				return BadRequest("Something went wrong");
			}
		}

		[HttpGet] 
		[Route("factory/{definition}")]
		public async Task<IActionResult> getSystemFactory( int definition )
		{
			try {
				var systems = await _dao.getFactory(definition);
				return Ok( systems.JSON );
			} 	
			catch(TTRPGSystemException e){
				return BadRequest(e.Message );
			}
			catch(Exception e){
				Logger.LogError(e, $"input: definition={ definition } " );
				return BadRequest("Something went wrong2");
			}
		}

		[HttpPut] 
		[Route("factory")]
		public async Task<IActionResult> supdateSystemFactory( int definition , string JSON )
		{
			try {
				var systems = await _dao.updateFactory( definition , JSON );
				return Ok( systems );
			} 	
			catch(TTRPGSystemException e){
				return BadRequest(e.Message );
			}
			catch(Exception e){
				Logger.LogError(e, $"input: definition={definition} JSON={JSON}" );
				return BadRequest("Something went wrong");
			}
		}


	}
}