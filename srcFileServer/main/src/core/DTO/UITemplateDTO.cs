namespace srcServer.core.database {

	public class UITemplateDTO  {
		public int		id          {get;set;}
		public Guid	    dId  		{get;set;}
        public string	name        {get;set;} 
        public string	version     {get;set;}

		public virtual SystemDefinitionDTO _ef_systemDefinition { get; set; }
        public virtual ICollection<UITemplateFileDTO> _ef_UITemplateFiles { get; set; }
	}
}