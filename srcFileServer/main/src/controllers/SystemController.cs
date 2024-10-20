using System;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using srcServer.core.database;
using srcServer.core.fileHandler;
using srcServer.repositories;

namespace srcServer.Controllers
{
	[ApiController]
	[Route("api")]
	public class SystemDefinitions : ControllerBase
	{

		private DatabaseContext _db;
		private SystemsRepository _repo;
		public SystemDefinitions(  DatabaseContext dbcontext, SystemsRepository repo ){
			_db = dbcontext;
			_repo = repo;
		}

		[HttpGet]
		[Route("system")]
		public async Task<IActionResult> GetAllSystems()
		{
			try {
				var systems = _db.systemDefinitions.ToList();
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
				var systems = _repo.EditSystem(update);
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
				_repo.DeleteSystem(system.code);
				return Ok( );
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
				var cpy =_repo.CopySystem(system.code);
				return Ok( cpy );
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
				var factory = _repo.getFactory( definition );
				return Ok( factory.JSON );
			} 	
			catch(TTRPGSystemException e){
				return BadRequest(e.Message );
			}
			catch(Exception e){
				Logger.LogError(e, $"input: id ={definition} " );
				return BadRequest("Something went wrong2");
			}
		}

		[HttpPut] 
		[Route("factory")]
		public async Task<IActionResult> updateSystemFactory( int definition , string JSON )
		{
			try {
				var fac = _repo.updateFactory(definition,JSON);
				return Ok( fac );
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