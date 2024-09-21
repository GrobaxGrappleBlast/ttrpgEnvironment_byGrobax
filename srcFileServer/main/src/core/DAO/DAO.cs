using System.Data;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;
using Dapper; 

namespace srcServer.core.fileHandler {
 
	public class DAO {
		
		private readonly string _connectionString;
		private readonly IConfiguration _config;
    	public DAO ( IConfiguration config ){
			_config = config; 
			_connectionString = config.GetConnectionString("default");
    	} 

        public async Task<SystemDefinitionDTO[]> LoadAllAvailableSystems (){
			try {
				using (var connection = new MySqlConnection(_connectionString))
				{
					connection.Open();
					var res = connection.Query<SystemDefinitionDTO>("SELECT * FROM TTPRPGSystem.definition WHERE 1");
					return res.ToArray();
				}
			}catch(Exception e){
				var a = 12; 
			}
			return [];
		} 
        
	}
		 
}