
using System.Text.Json.Serialization;

namespace srcServer.core.database {
	public class fileResourcesDTO  {
		public int		id		{get;set;}
		public string	name 	{get;set;}
		public string	version {get;set;}
		public byte[]	data	{get;set;} 
	}
}