using Microsoft.EntityFrameworkCore;
using ZstdSharp.Unsafe;


namespace srcServer.core.database{
    public class DatabaseContext : DbContext
	{
		public DatabaseContext(DbContextOptions<DatabaseContext> options) : base(options) { }

		public DbSet<SystemDefinitionDTO>	systemDefinitions	{ get; set; }
		public DbSet<SystemFactoryDTO>		factories			{ get; set; }
		public DbSet<SystemDefinitionDTO>	fileResources		{ get; set; }
		public DbSet<UITemplateDTO>			UITemplates			{ get; set; }
		public DbSet<UITemplateFileDTO>		UITemplateFiles		{ get; set; }
			




        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            
            // Our data base already exists. so we define what properties map to wich tables 
            modelBuilder.Entity<SystemDefinitionDTO>().ToTable("systemDefinitions")	.HasKey(sf => sf.id);
            modelBuilder.Entity<SystemFactoryDTO>   ().ToTable("factories")			.HasKey(sf => sf.dId);
            modelBuilder.Entity<fileResourcesDTO>   ().ToTable("fileResources")		.HasKey(sf => sf.id);
			modelBuilder.Entity<UITemplateDTO>   	().ToTable("UITemplates")		.HasKey(sf => sf.id);
			modelBuilder.Entity<UITemplateFileDTO>  ().ToTable("UITemplateFiles")	.HasKey(sf => sf.id);

			modelBuilder.Entity<fileResourcesDTO>	().Property( e => e.data ).HasColumnType("MEDIUMBLOB"); 
			modelBuilder.Entity<SystemDefinitionDTO>().Property( e => e.code ).HasColumnType("uuid");
			modelBuilder.Entity<SystemDefinitionDTO>().HasIndex( sd => sd.code ).IsUnique();
			modelBuilder.Entity<UITemplateFileDTO>().Property( e => e.data ).HasColumnType("MEDIUMBLOB");

			// maintain system defition virtual links
			// systemdefinition to factory
			modelBuilder.Entity<SystemDefinitionDTO>()
			.HasOne	(sd => sd	._ef_Factory			)
			.WithOne(f 	=> f	._ef_SystemDefinition	)
			.HasPrincipalKey<SystemDefinitionDTO>( sd => sd.code )
			.HasForeignKey<SystemFactoryDTO>( f => f.dId );
			
			// --- UITemplate --- 
			// factory foreign to its definition
			modelBuilder.Entity<SystemDefinitionDTO>()
			.HasMany			( sd => sd._ef_UITemplate )
			.WithOne			( t  => t._ef_systemDefinition )
			.HasPrincipalKey	( sd => sd.code )
			.HasForeignKey		( f => f.dId ); 
			
			// --- UITemplate FILES--- 
			// add virtual links between uitemplate and uitemplatefiles
			modelBuilder.Entity<UITemplateFileDTO>()
			.HasOne			( utf	=> utf._ef_UITemplate		)
			.WithMany		( ut	=> ut._ef_UITemplateFiles	)
			.HasForeignKey	( utf	=> utf.uiId					)
			.OnDelete		( DeleteBehavior.Cascade);  
 
			modelBuilder.Entity<UITemplateFileDTO>()
			.HasOne			( utf	=> utf._ef_systemDefinition		)
			.WithMany		( sd => sd._ef_UITemplateFiles )
			.HasForeignKey	( utf	=> utf.dId	)
			.HasPrincipalKey( sd => sd.code )
			.OnDelete		( DeleteBehavior.Cascade);  

			modelBuilder.Entity<UITemplateDTO>()
			.HasOne			( sd	=> sd._ef_systemDefinition		)
			.WithMany		( ut	=> ut._ef_UITemplate			)		
			.HasForeignKey	( sd	=> sd.dId						)
			.HasPrincipalKey( sd => sd.code)
			.OnDelete		( DeleteBehavior.Cascade);   
			


        }
    }
}