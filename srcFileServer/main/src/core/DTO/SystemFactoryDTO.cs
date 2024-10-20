 
namespace srcServer.core.database {

	public class SystemFactoryDTO  {
		public Guid		dId			{get;set;}
		public string	JSON		{get;set;}

		public virtual SystemDefinitionDTO _ef_SystemDefinition { get; set; }
	}
}