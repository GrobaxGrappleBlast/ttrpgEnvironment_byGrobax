using System;
using System.Text.Json;
using Dapper;
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
		private DatabaseContext _db;
		public TemplateController(  TemplateRepository templateRepository ,  DatabaseContext db)
		{
			_templateRepository = templateRepository; 
			_db = db;
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

		[HttpPut]
		[Route("{definitionCode}/{name}/{version}")]  
		public async Task<IActionResult> CreateUITemplate( Guid definitionCode , string name, string version ){
			try
			{
				var uitemplate = await _templateRepository.CreateUITemplate(definitionCode,name,version);
				return Ok(uitemplate);
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

		[HttpPut]
		[Route("{definitionCode}/{name}/")]  
		public async Task<IActionResult> CreateUITemplate_NoVersion( Guid definitionCode , string name ){
			try
			{
				var uitemplate = await _templateRepository.CreateUITemplate(definitionCode,name,null);
				return Ok(uitemplate);
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
		[Route("{definitionCode}/{UITemplateName}")] 
		public async Task<IActionResult> getUITemplateFileIndex( Guid definitionCode , string UITemplateName ){
			try
			{

				var versions = _db.UITemplates
				.Where( p => p.dId == definitionCode && p.name == UITemplateName )
				.Select( p => p.version )
				.ToArray();
				
				// Serve the image directly for public access
				return Ok(versions);
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


		[HttpGet]
		[Route("all/{definitionCode}")] 
		public async Task<IActionResult> getUITemplatesIndicies( Guid definitionCode ){
			try
			{
				var arr =_db.UITemplates
				.Where( p => p.dId == definitionCode )
				.Select( p => new {
					name	= p.name,
					version = p.version
				})
				.ToArray();
				
				// Serve the image directly for public access
				return Ok(arr);
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