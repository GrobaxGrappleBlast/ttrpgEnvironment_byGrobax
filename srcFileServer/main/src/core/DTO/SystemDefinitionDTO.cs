using System.Text.Json.Serialization;

namespace srcServer.core.database {
	public class SystemDefinitionDTO  {
		public int		id		{get;set;}
		public string	name	{get;set;}
		public Guid		code	{get;set;}
		public string	author	{get;set;}
		public string	version {get;set;}

		[JsonIgnore]
		public virtual SystemFactoryDTO _ef_Factory { get; set; } 
		
		[JsonIgnore]
		public virtual ICollection<UITemplateDTO> _ef_UITemplate { get; set; }
		
		[JsonIgnore]
		public virtual ICollection<UITemplateFileDTO> 	_ef_UITemplateFiles { get; set; }
	}

}
