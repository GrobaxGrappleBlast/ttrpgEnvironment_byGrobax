using System.Data;
using Microsoft.AspNetCore.Mvc;


namespace srcServer.core.fileHandler {
 
	public class DAO {
		
		private readonly IConfiguration _config;
		public DAO( IConfiguration config ){
			this._config = config;
		}

        public async Task LoadData (){
			//using IDbConnection connection = new SqlConnnection(_config.GetConnectionString(connectionId));
			
			var a = 12 + 2 ;



			var b = 12 + 2 + 2;

		}
		public static string connstr = "server=localhost;user=root;password=passwd;database=TTPRPGSystem;";
        
	}
		 
}