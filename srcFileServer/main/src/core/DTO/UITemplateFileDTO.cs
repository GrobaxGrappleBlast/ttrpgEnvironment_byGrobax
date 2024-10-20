	namespace srcServer.core.database {

		public class UITemplateFileDTO  {
			public int		id			{get;set;}
			public int		uiId		{get;set;}
			public Guid		dId			{get;set;}
			public string	name		{get;set;}
			public string	version		{get;set;}
			public byte[]	data		{get;set;}
	
			public virtual UITemplateDTO 		_ef_UITemplate			{ get; set; }
			public virtual SystemDefinitionDTO	_ef_systemDefinition	{ get; set; }
			
		}
	}