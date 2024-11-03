 
using System.Text.Json.Serialization;

namespace srcServer.core.database {

	public class SystemFactoryDTO  {
		public Guid		dId			{get;set;}
		public string	JSON		{get;set;}

		[JsonIgnore]
		public virtual SystemDefinitionDTO _ef_SystemDefinition { get; set; }
	}
}