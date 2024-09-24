using System.Data;
using Microsoft.AspNetCore.Mvc;
using MySql.Data.MySqlClient;
using System.Collections.Generic;
using Microsoft.Extensions.Configuration;
using Dapper;
using System.Reflection.Metadata;

namespace srcServer.core.fileHandler {
 
	public class DAO {
		
		private readonly string _connectionString;
		private readonly IConfiguration _config;
    	public DAO ( IConfiguration config ){
			_config = config; 
			_connectionString = config.GetConnectionString("default");
    	} 
 
        public async Task<SystemDefinitionDTO[]> LoadAllAvailableSystems (){
			 
			using (var connection = new MySqlConnection(_connectionString))
			{
				connection.Open();
				var res = connection.Query<SystemDefinitionDTO>("SELECT * FROM TTPRPGSystem.definition WHERE 1");
				return res.ToArray();
			}
		} 
		public async Task<SystemDefinitionDTO> createSystem ( string systemName, string author ){
			 
			using (var connection = new MySqlConnection(_connectionString))
			{
				connection.Open();
				

				// Insert and get last inserted ID
				var lastInsertedId = connection.ExecuteScalar<int>(
					$"INSERT INTO TTPRPGSystem.definition (`name`, `author`) VALUES ('{systemName}', '{author}'); SELECT LAST_INSERT_ID();"
				);

				// Query the inserted row
				var insertedRow = connection.QueryFirstOrDefault<SystemDefinitionDTO>(
					$"SELECT * FROM TTPRPGSystem.definition WHERE id = {lastInsertedId}"
				);
				
				return insertedRow;
			}
		 
		}
		public async Task<SystemDefinitionDTO> createSystem ( SystemDefinitionDTO system ){
			return await this.createSystem(system.name, system.author);
		}
		public async Task<SystemDefinitionDTO> updateSystem ( SystemDefinitionDTO system ){
			
			using (var connection = new MySqlConnection(_connectionString))
			{
				connection.Open();
				
				// Insert and get last inserted ID
				string sql = $"UPDATE TTPRPGSystem.definition SET `name` = '{system.name}', `author` = '{system.author}' , `version` = '{system.version}' WHERE code = '{system.code}' ";
				var affedtedRows = await connection.ExecuteAsync( sql	);
				if(affedtedRows == 0){
					throw new TTRPGSystemException($"No Systems Updated, no Match with code = '{system.code}'");
				}

				// Query the inserted row
				var insertedRow = connection.QueryFirstOrDefault<SystemDefinitionDTO>(
					$"SELECT * FROM TTPRPGSystem.definition WHERE code = '{system.code}';"
				);
				
				return insertedRow;
			}
		
		}
		public async Task<bool> deleteSystem ( SystemDefinitionDTO system ){
			 
			using (var connection = new MySqlConnection(_connectionString))
			{
				connection.Open();

				// Insert and get last inserted ID
				string sql = $"DELETE FROM TTPRPGSystem.definition WHERE code = '{system.code}' ";
				var affedtedRows = await connection.ExecuteAsync( sql	);
				if(affedtedRows == 0){
					throw new TTRPGSystemException($"No Systems deleted, no Match with code = '{system.code}'");
				}
				
				return true;
			}
		} 
		public async Task<SystemDefinitionDTO> copySystem ( SystemDefinitionDTO system ){
			
			using (var connection = new MySqlConnection(_connectionString))
			{
				connection.Open();
				SystemDefinitionDTO sys2;
				using (MySqlTransaction transaction = connection.BeginTransaction())
            	{
					
					//Select the system and relace the input. 
					var sys = connection.QueryFirstOrDefault<SystemDefinitionDTO>(
						$"SELECT * FROM TTPRPGSystem.definition WHERE code = '{system.code}';"
					);
					if (!(sys!=null)){
						throw new TTRPGSystemException("No System to copy with this code");
					}
					// copy definition.
					var lastInsertedId = connection.ExecuteScalar<int>(
						$"INSERT INTO TTPRPGSystem.definition (`name`, `author`, `version`) VALUES ('{sys.name}','{sys.author}','{sys.version}'); SELECT LAST_INSERT_ID();"
					); 
					sys2 = connection.QueryFirstOrDefault<SystemDefinitionDTO>(
						$"SELECT * FROM TTPRPGSystem.definition WHERE id = {lastInsertedId};"
					);


					// copy the factory 
					var factory = connection.QueryFirstOrDefault<SystemFactoryDTO>(
						$"SELECT * FROM TTPRPGSystem.factory WHERE definition = {sys.id};"
					);
					connection.Query(
						$"INSERT INTO TTPRPGSystem.factory (`definition`, `JSON` ) VALUES ({sys2.id}, '{factory.JSON}');"
					); 


					// copy data indicies 
					var dataTable_indicies = connection.Query<SystemDataTableIndexDTO>(
						$"SELECT * FROM TTPRPGSystem.dataTable_index WHERE definition = {sys.id};"
					).ToArray();
					string sql = "";
					foreach (var index in dataTable_indicies)
					{
						sql += $"\n INSERT INTO TTPRPGSystem.dataTable_index (`definition`,`group`,`collection`,`table`) VALUES ({sys.id},'{index.group}','{index.collection}','{index.table}');"; 
					}
					connection.Query<SystemDataTableIndexDTO>( sql );


					// copy data data
					var dataTable_table = connection.Query<dynamic>(
						@$"
							SELECT D.* , I.table_id as DataFROM 
								TTPRPGSystem.dataTable_data as D,
								TTPRPGSystem.dataTable_index as I
							WHERE 
								I.definition = {sys.id}
							;"
					).ToArray();
					sql = "";
					foreach (var index in dataTable_table)
					{
						sql += $"\n INSERT INTO TTPRPGSystem.dataTable_data (`table_id`,`level`) VALUES ({index.table_id},'{index.level}');"; 
					}
					connection.Query<SystemDataTableIndexDTO>( sql );
 

					transaction.Commit();
				}
				return sys2;
			}
		
		}
		

		  
		public async Task<SystemFactoryDTO> getFactory ( int definition  ){
			
			using (var connection = new MySqlConnection(_connectionString))
			{
				connection.Open();
				
				 
				var factory = connection.QueryFirstOrDefault<SystemFactoryDTO>(
					$"SELECT * FROM TTPRPGSystem.definition WHERE definition = {definition};"
				);
				if (factory == null){
					var lastInsertedId = connection.ExecuteScalar<int>(
						$"INSERT INTO TTPRPGSystem.factory (`definition`) VALUES ('{definition}');"
					);
					factory = connection.QueryFirstOrDefault<SystemFactoryDTO>(
						$"SELECT * FROM TTPRPGSystem.definition WHERE definition = {definition};"
					);
				}
				

				return factory;
			} 
		}
		public async Task<SystemFactoryDTO> updateFactory ( int definition , string JSON){
			
			using (var connection = new MySqlConnection(_connectionString))
			{
				connection.Open();
				
				// Insert and get last inserted ID
				var lastInsertedId = connection.ExecuteScalar<int>(
					$"REPLACE INTO TTPRPGSystem.factory (`definition`, `JSON`) VALUES ('{definition}', '{JSON}'); SELECT LAST_INSERT_ID();"
				);
				 
				var insertedRow = connection.QueryFirstOrDefault<SystemFactoryDTO>(
					$"SELECT * FROM TTPRPGSystem.definition WHERE definition = {definition};"
				);
				return insertedRow;
			} 
		}
		



	}
		 
}