using System;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using srcServer.core.fileHandler;

namespace srcServer.Controllers
{
	[ApiController]
	[Route("api/template")]
	public class TemplateController : ControllerBase
	{
		private DAO _dao;
		public TemplateController( DAO dao){
			_dao = dao;
		}

        [HttpPost]
		public async Task<IActionResult> addPrimaryTemplate( [FromForm] List<IFormFile> files, IFormCollection form )
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


	}
}