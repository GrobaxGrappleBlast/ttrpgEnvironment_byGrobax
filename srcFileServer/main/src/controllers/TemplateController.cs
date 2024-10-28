using System;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using srcServer.core.database;
using srcServer.core.fileHandler;
using srcServer.repositories; 
namespace srcServer.Controllers
{
 
	[ApiController]
	[Route("api/template")]
	public class TemplateController : ControllerBase
	{
		private static readonly Dictionary<string, string> ContentTypeMappings = new()
		{
			{ ".jpg", "image/jpeg" },
			{ ".png", "image/png" },
			{ ".gif", "image/gif" },
			{ ".pdf", "application/pdf" },
			{ ".txt", "text/plain" },
			{ ".js", "text/javascript"},
			{ ".cjs", "application/javascript"},
			{ ".css", "text/css" }
			// Add more mappings as needed
		};
		private TemplateRepository _templateRepository;
		public TemplateController(  TemplateRepository templateRepository )
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

		[HttpGet]
		[Route("{definitionCode}/{UITemplateName}/{fileName}")] 
		public async Task<IActionResult> getUITemplateFile( Guid definitionCode , string UITemplateName, string fileName , string? UITemplateVersion ){
			
			try
			{
				UITemplateFileDTO data = await _templateRepository.getUITemplate(definitionCode,UITemplateName,fileName,UITemplateVersion);
				
				int lastSlashIndex	= fileName.LastIndexOf('/');
				string _fileName	= fileName.Substring(lastSlashIndex + 1);
				int firstDotIndex	= _fileName.LastIndexOf('.');
				string _ext			= _fileName.Substring(firstDotIndex );

				ContentTypeMappings.TryGetValue( _ext , out string contentType );
				
				
				// Serve the image directly for public access
				return File(data.data, contentType);
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

		[HttpGet]
		[Route("download/{definitionCode}/{UITemplateName}/{fileName}")] 
		public async Task<IActionResult> downloadUITemplateFile( Guid definitionCode , string UITemplateName, string fileName , string? UITemplateVersion ){
			
			try
			{
				UITemplateFileDTO data = await _templateRepository.getUITemplate(definitionCode,UITemplateName,fileName,UITemplateVersion);
				
				int lastSlashIndex	= fileName.LastIndexOf('/');
				string _fileName	= fileName.Substring(lastSlashIndex + 1);
				int firstDotIndex	= _fileName.LastIndexOf('.');
				string _ext			= _fileName.Substring(firstDotIndex );

				ContentTypeMappings.TryGetValue( _ext , out string contentType );
				
				
				// Serve the image directly for public access
				return File(data.data, contentType , fileName );
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