
 
public class SystemDefinitionDTO  {
	public int		id		{get;set;}
	public string	name	{get;set;}
	public Guid		code	{get;set;}
	public string	author	{get;set;}
	public string	version {get;set;}
}

public class SystemFactoryDTO  {
	public int		definition	{get;set;}
	public string	JSON		{get;set;}
}

public class SystemDataTableIndexDTO  {
	public int		id	{get;set;}
	public int		definition	{get;set;}
	public string	group		{get;set;}
	public string	collection	{get;set;}
	public string	table		{get;set;}
}

public class SystemDataTableDataDTO  {
	public int		id	{get;set;}
	public int		table_id	{get;set;}
	public int		level		{get;set;} 
}