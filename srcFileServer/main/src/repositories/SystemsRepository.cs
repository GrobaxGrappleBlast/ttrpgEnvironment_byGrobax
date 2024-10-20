
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
	public class SystemsRepository {

		private DatabaseContext _db;
		public SystemsRepository( DatabaseContext dbcontext ){
			_db = dbcontext;
		}

		public SystemDefinitionDTO EditSystem( SystemDefinitionDTO sys ){

			var dSys = _db.definition.FirstOrDefault(p => p.code == sys.code );
			if(dSys == null)
				throw new TTRPGSystemException("no System definition with code:" + sys.code);

			
			// you  get to update these 
			dSys.author = sys.author;
			dSys.name 	= sys.name;
			dSys.version= sys.version;

			// you do not get to update these 
			// dSys.code;
			// dSys.id
			
			_db.SaveChanges();
			return dSys;
		}
		public void DeleteSystem( Guid code ){

			var sys = _db.definition.FirstOrDefault(p => p.code == code );
			if (sys == null)
			 	throw new TTRPGSystemException("no System definition with code:" + code);

			_db.definition.Remove(sys);
			_db.SaveChanges();
			
		}
		public SystemDefinitionDTO CopySystem( Guid code ){

			var sys = _db.definition.Include(f=>f._ef_Factory).FirstOrDefault( p => p.code == code );
			if (sys == null)
		        throw new TTRPGSystemException("No System definition with code: " + code);

			var nSys = new SystemDefinitionDTO{
				name = sys.name,
				code = Guid.NewGuid()
			};

			var factoryToCopy = sys._ef_Factory;
			if(sys._ef_Factory != null  ){
				var nFac = new SystemFactoryDTO{
					dId = nSys.code,
					JSON = factoryToCopy.JSON
				};
				nSys._ef_Factory = nFac;
			}

			_db.definition.Add(nSys);
    		_db.SaveChanges();
			
			return _db.definition.Find(nSys.id); 
		}
		public SystemFactoryDTO getFactory( int id ){
			SystemFactoryDTO? fac = _db.factory.Find(id);
			if (fac == null)
				throw new TTRPGSystemException("No Factory available for this system");
			return fac;
		}
		public SystemFactoryDTO updateFactory( int id , string JSON ){
			
			var fac = _db.factory.Find(id);
			if( fac == null)
				throw new TTRPGSystemException("no factory available for id");
			
			fac.JSON = JSON;
			// you do not get to update these 
			// dSys.code;
			// dSys.id
			
			_db.SaveChanges();
			return fac;
		}

	
	
	}
}