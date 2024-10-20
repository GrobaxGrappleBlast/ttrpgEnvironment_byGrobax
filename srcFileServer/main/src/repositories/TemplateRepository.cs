
using System;
using System.Data.SqlClient;
using System.IO.Compression;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Utilities;
using srcServer.core.database;
using srcServer.core.fileHandler;


namespace srcServer.repositories
{
	public class TemplateRepository {

	 
		private DatabaseContext _db;

		public TemplateRepository( DatabaseContext db){ 
			_db = db;
		}
	
		public async Task<byte[]> BundleFilesAndZip( IFormFile[] files ){

			// Create ZIP in memory
			using (var memoryStream = new MemoryStream())
			{
				using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, true))
				{
					foreach (var file in files)
					{
						var zipEntry = archive.CreateEntry(file.FileName, CompressionLevel.Fastest);

						using (var originalFileStream = file.OpenReadStream())
						using (var zipEntryStream = zipEntry.Open())
						{
							await originalFileStream.CopyToAsync(zipEntryStream);
						}
					}
				}

				// Convert memory stream to byte array (this is the ZIP file content)
				byte[] zipBytes = memoryStream.ToArray();
				return zipBytes;
			
			} 
			
		}

		public async Task saveUITemplate( Guid defCode ,string UITemplateName , string version, IFormFile[] files ){

			
			// first get the definition
			SystemDefinitionDTO definition = _db.definition.Where(p=>p.code == defCode).First();
			if (definition == null){
				throw new TTRPGSystemException("No Definition with this Code " + defCode );
			}

			// see if the ui template exists, with files if it exists. 
			UITemplateDTO? uiTemplate =
			_db.uiTemplates
			.Where( p => 
				p.dId == definition.code &&
				p.name == UITemplateName &&
				p.version == version
				)
			.Include(p => p._ef_UITemplateFiles )
			.FirstOrDefault();

			if ( uiTemplate != null ){
				// remove this versions old files 
				_db.uiTemplateFiles.RemoveRange( uiTemplate._ef_UITemplateFiles );

			}else{
				
				// if it does not exists create it .
				uiTemplate = new UITemplateDTO{
					dId = definition.code,
					name = UITemplateName,
					version = version
				};
				_db.uiTemplates.Add(uiTemplate);
			}


			foreach (var file in files){
				// Create ZIP in memory
				using (var memoryStream = new MemoryStream())
				{
					await file.CopyToAsync(memoryStream);
					byte[] fileBytes = memoryStream.ToArray();
					string fileName = file.FileName;

					var dto = new UITemplateFileDTO{
						dId	= definition.code,
						uiId		= uiTemplate.id,
						name 		= fileName,
						version 	= version,
						data		= fileBytes
					};

					_db.uiTemplateFiles.Add(dto);
					// Save the ZIP byte[] to the database
					// await _dao.SaveFileResouce( "UITemplate","0.0.1", zipBytes);  // Assuming this method saves to your DB
					//return Ok(new { message = "ZIP file saved to database successfully." });
				}
			} 
		}
	}
}