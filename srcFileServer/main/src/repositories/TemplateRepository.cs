
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
			SystemDefinitionDTO definition = _db.systemDefinitions.Where(p=>p.code == defCode).First();
			if (definition == null){
				throw new TTRPGSystemException("No Definition with this Code " + defCode );
			}

			// see if the ui template exists, with files if it exists. 
			UITemplateDTO? uiTemplate =
			_db.UITemplates
			.Where( p => 
				p.dId == definition.code &&
				p.name == UITemplateName &&
				p.version == version
				)
			.Include(p => p._ef_UITemplateFiles )
			.FirstOrDefault();

			if ( uiTemplate != null ){
				// remove this versions old files 
				_db.UITemplateFiles.RemoveRange( uiTemplate._ef_UITemplateFiles );

			}else{
				
				// if it does not exists create it .
				uiTemplate = new UITemplateDTO{
					dId = definition.code,
					name = UITemplateName,
					version = version
				};
				_db.UITemplates.Add(uiTemplate);
				await _db.SaveChangesAsync();
			}


			foreach (var file in files){
				// Create ZIP in memory
				using (var memoryStream = new MemoryStream())
				{
					await file.CopyToAsync(memoryStream);
					byte[] fileBytes = memoryStream.ToArray();
					var i = file.FileName.IndexOf('/');
					string fileName = file.FileName.Substring(i + 1);

					var dto = new UITemplateFileDTO{
						dId			= definition.code,
						uiId		= uiTemplate.id,
						name 		= fileName,
						version 	= version,
						data		= fileBytes
					};

					_db.UITemplateFiles.Add(dto);
					_db.SaveChanges();
					// Save the ZIP byte[] to the database
					// await _dao.SaveFileResouce( "UITemplate","0.0.1", zipBytes);  // Assuming this method saves to your DB
					//return Ok(new { message = "ZIP file saved to database successfully." });
				}
			}  
		}

		public async Task<UITemplateDTO> CreateUITemplate( Guid defCode ,string UITemplateName , string? version ){

			
			// first get the definition
			SystemDefinitionDTO definition = _db.systemDefinitions.Where(p=>p.code == defCode).First();
			if (definition == null){
				throw new TTRPGSystemException("No Definition with this Code " + defCode );
			}

			// see if the ui template exists, with files if it exists. 
			UITemplateDTO? uiTemplate ;
			if (version != null ){
				uiTemplate =
				_db.UITemplates
				.Where( p => 
					p.dId == definition.code &&
					p.name == UITemplateName &&
					p.version == version
					)
				.Include(p => p._ef_UITemplateFiles )
				.FirstOrDefault();

				if (uiTemplate != null){
					throw new TTRPGSystemException($"Template '{UITemplateName}' already exists with version '{version}'");
				}
			}
			else {
				uiTemplate =
				_db.UITemplates
				.Where( p => 
					p.dId == definition.code &&
					p.name == UITemplateName
					)
				.Include(p => p._ef_UITemplateFiles )
				.FirstOrDefault();

				if (uiTemplate != null){
					throw new TTRPGSystemException($"Template '{UITemplateName}' already exists");
				}
			}
 				
			if(version == null){
				version = "0.0.1";
			}

			// if it does not exists create it .
			uiTemplate = new UITemplateDTO{
				dId = definition.code,
				name = UITemplateName,
				version = version
			};
			_db.UITemplates.Add(uiTemplate);
			await _db.SaveChangesAsync();

			#pragma warning disable CS8603 // Possible null reference return.
            
			return _db.UITemplates
			.Where( p => 
				p.dId		== definition.code &&
				p.name		== UITemplateName &&
				p.version	== version
			)
			.FirstOrDefault();

			#pragma warning restore CS8603 // Possible null reference return.
        }


		public async Task<ICollection<UITemplateFileDTO>> getAllUITemplateFiles( Guid defCode , string UITemplateName, string? UITemplateVersion ){
			
			// first get the definition
			SystemDefinitionDTO definition = _db.systemDefinitions.Where(p=>p.code == defCode).First();
			if (definition == null){
				throw new TTRPGSystemException("No Definition with this Code " + defCode );
			}

			UITemplateDTO? uiTemplate =
			_db.UITemplates
			.Where( p =>
				p.dId	== defCode &&
				p.name	== UITemplateName &&
				( UITemplateVersion != null ? p.version == UITemplateVersion : true )
			) 
			.Include(p => p._ef_UITemplateFiles )
			.FirstOrDefault();

			ICollection<UITemplateFileDTO> files = uiTemplate._ef_UITemplateFiles;
			return files;
		}

		public async Task<UITemplateFileDTO> getUITemplate( Guid defCode , string UITemplateName, string fileName , string? UITemplateVersion ){
			
			// first get the definition
			SystemDefinitionDTO definition = _db.systemDefinitions.Where(p=>p.code == defCode).FirstOrDefault();
			if (definition == null){
				throw new TTRPGSystemException("No Definition with this Code " + defCode );
			}

			UITemplateDTO? uiTemplate =
			_db.UITemplates
			.Where( p =>
				p.dId	== defCode &&
				p.name	== UITemplateName && 
				( UITemplateVersion != null ? p.version == UITemplateVersion : true )	
			) 
			.Include(p => p._ef_UITemplateFiles.Where(f => f.name == fileName) )
			.FirstOrDefault();

			
			if(uiTemplate == null || !uiTemplate._ef_UITemplateFiles.Any() ){
				throw new TTRPGSystemException("No file with this Code " + defCode + " and this UITemplateName " + UITemplateName + " and this fileName " + fileName  );
			}

			var highestVersionFile = uiTemplate._ef_UITemplateFiles.OrderBy( p => p.version ).Last();

			if(highestVersionFile == null){
				throw new TTRPGSystemException("No file with this Code " + defCode + " and this UITemplateName " + UITemplateName + " and this fileName " + fileName  );
			}
			return highestVersionFile;
		}
	}
}