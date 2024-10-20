using System;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using srcServer.core.fileHandler;
using srcServer.repositories;

namespace srcServer.Controllers
{
	[ApiController]
	[Route("api/template")]
	public class TemplateController : ControllerBase
	{
		 
		private TemplateRepository _templateRepository;
		public TemplateController(  TemplateRepository templateRepository)
		{
	
			_templateRepository = templateRepository;
		}
		


		[HttpPost]
		public async Task<IActionResult> SaveUITemplate( [FromForm] Guid definitionCode ,[FromForm] string name, [FromForm] string version , IFormCollection form){
			try
			{
				IFormFile[] files = form.Files.ToArray<IFormFile>();
				await _templateRepository.saveUITemplate(definitionCode,name,version,files);
				return Ok();
			}
			catch (TTRPGSystemException e)
			{
				return BadRequest(e.Message);
			}
			catch (Exception e)
			{
				Logger.LogError(e);
				return BadRequest("Something went wrong");
			}
		}

		

	}
}