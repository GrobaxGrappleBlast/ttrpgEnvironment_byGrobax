using Microsoft.AspNetCore.Mvc;


namespace srcServer.core.fileHandler {
	class FileHandler{

		private static string getSystemsPath(){
			
			string path = Path.Combine(Directory.GetCurrentDirectory(), "../Systems");
			string fullPath = Path.GetFullPath(path);

			return fullPath;
		}
		private static string getExtendedFilePath( string path ){
			
			string _path = Path.Combine( FileHandler.getSystemsPath(), path );
			string fullPath = Path.GetFullPath(_path);

			return fullPath;
		}
		
		// Folder Handling
		public async static Task<bool> mkdir ( string path ){
			string _path = FileHandler.getExtendedFilePath(path);
			Directory.CreateDirectory(_path);
			if ( Directory.Exists(_path) ){
				return true;
			}
			return false;
		}
		public async static Task<bool> rmdir( string path){ 
			string _path = FileHandler.getExtendedFilePath(path);
			Directory.Delete(_path);
			if ( Directory.Exists(_path) ){
				return false;
			}
			return true;
		}


		// Path commands
		public async static Task<string[][]> lsdir( string path ){

			string _path = FileHandler.getExtendedFilePath( path );
			string[] folders = Directory.GetDirectories(_path);
			string[] files 	= Directory.GetFiles(_path);
	
			return [folders,files];
		}
		public async static Task<bool> exists( string path ) {
			
			string _path = FileHandler.getExtendedFilePath( path );
			return Directory.Exists( _path ) || File.Exists(_path);
	
		}

		// File Commands 
		public async static Task saveFile( string path , string fileContent ){ 
			string _path = FileHandler.getExtendedFilePath( path );
			File.WriteAllText(_path, fileContent); 
		}	
		public async static Task<string> readFile( string path ){ 
			string _path = FileHandler.getExtendedFilePath( path ); 
			return File.ReadAllText(_path);
		}
	
		public async static Task<bool> rm( string path ){ 
			string _path = FileHandler.getExtendedFilePath( path ); 
			Directory.Delete(_path);
			File.Delete(_path);
			return await FileHandler.exists(_path);
		}

		public async static Task copy( string path , string newPath ){ 

			string _path1 = FileHandler.getExtendedFilePath( path ); 
			string _path2 = FileHandler.getExtendedFilePath( newPath ); 

			bool isFile = false;
			if ( path.Contains('.') ){
				isFile = true;
			}

			if (isFile){
				File.Copy( _path1, _path2, true);
			}
			else {
				await FileHandler.CopyDirectory(_path1, _path2, true);
			}
		}

		private async static Task CopyDirectory(string sourceDir, string destinationDir, bool recursive)
		{
			// Get information about the source directory
			var dir = new DirectoryInfo(sourceDir);

			// Check if the source directory exists
			if (!dir.Exists)
				throw new DirectoryNotFoundException($"Source directory not found: {dir.FullName}");

			// Cache directories before we start copying
			DirectoryInfo[] dirs = dir.GetDirectories();

			// Create the destination directory
			Directory.CreateDirectory(destinationDir);

			// Get the files in the source directory and copy to the destination directory
			foreach (FileInfo file in dir.GetFiles())
			{
				string targetFilePath = Path.Combine(destinationDir, file.Name);
				file.CopyTo(targetFilePath);
			}

			// If recursive and copying subdirectories, recursively call this method
			if (recursive)
			{
				foreach (DirectoryInfo subDir in dirs)
				{
					string newDestinationDir = Path.Combine(destinationDir, subDir.Name);
					await FileHandler.CopyDirectory(subDir.FullName, newDestinationDir, true);
				}
			}
		}	
		
	}
}