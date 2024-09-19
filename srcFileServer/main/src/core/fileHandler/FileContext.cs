using System.Text.Json;
using Microsoft.AspNetCore.Mvc;


namespace srcServer.core.fileHandler {

	public static class FolderNames
	{
		public static readonly string Systems	= "Systems"	;
		public static readonly string UILayouts	= "UILayouts"	;
		public static readonly string DataTables	= "DataTables"	;
	}
	public static class FileNames
	{
		public static readonly string systemPreview	= "index.json"	;
		public static readonly string systemDesigner= "designer.json"	; 
	}

	public class FileContext{
		private static Mutex mutex = new Mutex();
		
		public static async Task<string[]> getAllSystems(){
			
			// search the folder
			var ls = await FileHandler.lsdir( FolderNames.Systems );

			// prepare variables to be filled;
			string[] systemPreviews = new string[ls.folders.Length + 1]; 
			
			// For each sub folder see if there is a good system inside.
			SystemPreview obj;
			for (int i = 0; i < ls.folders.Length; i++)
			{
				
				// get the path of the file and see if it exists.
				string path = FileHandler.Combine( FolderNames.Systems , ls.folders[i] , FileNames.systemPreview );
				if ( !await FileHandler.exists(path) ){
					await FileHandler.rm( FileHandler.Combine( FolderNames.Systems , ls.folders[i]) );
					continue;
				}
				
				// get the file and see if it is Valid JSON, if it iss add it.
				string file = await FileHandler.readFile(path);
				
				try{
				 	obj = JsonSerializer.Deserialize<SystemPreview>(file);
					systemPreviews[i] = file; 
				}catch(Exception e){
					await FileHandler.rm( FileHandler.Combine( FolderNames.Systems , ls.folders[i]) );
					continue;
				}
			}

			// only return non null items. 
			string[] ou = systemPreviews.Where(item => item != null).ToArray();
			return ou;
		}
	}
}