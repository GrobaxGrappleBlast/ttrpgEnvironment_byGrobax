using srcServer.core.fileHandler;
namespace tests;
 
[TestClass]
public class fileHandlerTests
{

	public static string TestFolder = "TestFolder";

	[TestMethod]
	public async Task mkdir			(){
		string testFolder = fileHandlerTests.TestFolder;
		
		// to run the test, the folder needs to not exist.
		if( await FileHandler.exists(testFolder) )
			await FileHandler.mkdir(testFolder);

		// now create it, and assert that it has been created
		await FileHandler.mkdir( FileHandler.Combine(testFolder, "mkdirFolder1"));
		Assert.IsTrue( await FileHandler.exists(FileHandler.Combine(testFolder, "mkdirFolder1")) );

		await FileHandler.rmdir(FileHandler.Combine(testFolder,"mkdirFolder1"));
	}

	[TestMethod]
	public async Task rmdir			(){
		string testFolder = fileHandlerTests.TestFolder;
		
		// to run the test, the folder needs to not exist.
		if( await FileHandler.exists(testFolder) )
			await FileHandler.mkdir(testFolder);

		// now create it, and assert that it has been created
		await FileHandler.mkdir(FileHandler.Combine(testFolder,"rmdir", "Folder1"));
		Assert.IsTrue( await FileHandler.exists(FileHandler.Combine(testFolder,"rmdir", "Folder1")) );

		// remove the created dir. Cleanup
		await FileHandler.rmdir(FileHandler.Combine(testFolder,"rmdir", "Folder1"));
		Assert.IsFalse( await FileHandler.exists(FileHandler.Combine(testFolder,"rmdir", "Folder1")) );
	}
	
	[TestMethod]
	public async Task lsdir			(){
		string testFolder = fileHandlerTests.TestFolder;
		
		// to run the test, the folder needs to exist
		if( !await FileHandler.exists(testFolder) )
			await FileHandler.mkdir(testFolder);

		// Create some Folders and some Files 
		await FileHandler.mkdir		( FileHandler.Combine(testFolder, "lsDir" ,"lsdirFolder1")	);
		await FileHandler.mkdir		( FileHandler.Combine(testFolder, "lsDir" ,"lsdirFolder2")	);
		await FileHandler.mkdir		( FileHandler.Combine(testFolder, "lsDir" ,"lsdirFolder3")	);
		await FileHandler.saveFile	( FileHandler.Combine(testFolder, "lsDir" ,"lsdirFile1") 	, "CONTENT 1");
		await FileHandler.saveFile	( FileHandler.Combine(testFolder, "lsDir" ,"lsdirFile2") 	, "CONTENT 2");
		
		// get the LS 
		var ls = await FileHandler.lsdir(FileHandler.Combine(testFolder, "lsDir"));
		Assert.AreEqual( 3 , ls.folders.Length 	);
		Assert.AreEqual( 2 , ls.files.Length 	);
		Assert.IsTrue(ls.folders.Contains("lsdirFolder1")	);
		Assert.IsTrue(ls.folders.Contains("lsdirFolder3")	);
		Assert.IsTrue(ls.folders.Contains("lsdirFolder2")	);
		Assert.IsTrue(ls.files	.Contains("lsdirFile2")		);
		Assert.IsTrue(ls.files	.Contains("lsdirFile1")		);

		await FileHandler.rmdir(FileHandler.Combine(testFolder, "lsDir"));	

	}
	
	[TestMethod]
	public async Task exists	(){
		string testFolder = fileHandlerTests.TestFolder;

		// to run the test, the folder needs to exist
		if( !await FileHandler.exists(testFolder) )
			await FileHandler.mkdir(testFolder);

		await FileHandler.mkdir		( FileHandler.Combine(testFolder,"exists")	);
		await FileHandler.mkdir		( FileHandler.Combine(testFolder,"exists", "existsFolder1")	);
		await FileHandler.saveFile	( FileHandler.Combine(testFolder,"exists", "existsFile1") 	, "CONTENT 1");
		Assert.IsTrue(await FileHandler.exists(FileHandler.Combine(testFolder,"exists", "existsFolder1")	));
		Assert.IsTrue(await FileHandler.exists(FileHandler.Combine(testFolder,"exists", "existsFile1")	));

		await FileHandler.rm( FileHandler.Combine(testFolder,"exists", "existsFolder1") );
		await FileHandler.rm( FileHandler.Combine(testFolder,"exists", "existsFile1") );
		Assert.IsFalse(await FileHandler.exists(FileHandler.Combine(testFolder,"exists", "existsFolder1")));
		Assert.IsFalse(await FileHandler.exists(FileHandler.Combine(testFolder,"exists", "existsFile1")	));

		await FileHandler.rm( FileHandler.Combine(testFolder,"exists") );
	}
	
	[TestMethod]
	public async Task saveFile_readFile		(){
		
		string testFolder = fileHandlerTests.TestFolder;

		// to run the test, the folder needs to exist
		if( !await FileHandler.exists(testFolder) )
			await FileHandler.mkdir(testFolder);

		string content = "CONTENT 1";
		await FileHandler.mkdir( FileHandler.Combine(testFolder,"saveFile_readFile"));
		await FileHandler.saveFile( FileHandler.Combine(testFolder,"saveFile_readFile", "File1") , content );
		Assert.IsTrue( await FileHandler.exists(FileHandler.Combine(testFolder,"saveFile_readFile", "File1")) );
		string content2 =	await FileHandler.readFile 	( FileHandler.Combine(testFolder	,"saveFile_readFile", "File1") );
		Assert.AreEqual(content,content2);

		await FileHandler.rmdir(FileHandler.Combine(testFolder,"saveFile_readFile"));

	}
	
	[TestMethod]
	public async Task rm				(){

		string testFolder = fileHandlerTests.TestFolder;

		// to run the test, the folder needs to exist
		if( !await FileHandler.exists(testFolder) )
			await FileHandler.mkdir(testFolder);

		await FileHandler.mkdir		( FileHandler.Combine(testFolder,"rm", "existsFolder1")	);
		await FileHandler.saveFile	( FileHandler.Combine(testFolder,"rm", "existsFile1") 	, "CONTENT 1");
		Assert.IsTrue(await FileHandler.exists(FileHandler.Combine(testFolder,"rm", "existsFolder1")	));
		Assert.IsTrue(await FileHandler.exists(FileHandler.Combine(testFolder,"rm", "existsFile1")	));

		await FileHandler.rm( FileHandler.Combine(testFolder,"rm", "existsFolder1") );
		await FileHandler.rm( FileHandler.Combine(testFolder,"rm", "existsFile1") );
		Assert.IsFalse(await FileHandler.exists(FileHandler.Combine(testFolder,"rm", "existsFolder1")));
		Assert.IsFalse(await FileHandler.exists(FileHandler.Combine(testFolder,"rm", "existsFile1")	));

		await FileHandler.rm( FileHandler.Combine(testFolder,"rm") );	 
	}
	
	[TestMethod]
	public async Task copy			(){

		string testFolder = fileHandlerTests.TestFolder;

		// to run the test, the folder needs to exist
		if( !await FileHandler.exists(testFolder) )
			await FileHandler.mkdir(testFolder);


		// folder level 1
		string folder1 = FileHandler.Combine(testFolder,"copy", "folder1");
		string file_1  = FileHandler.Combine(testFolder,"copy", "folder1", "file_1");
		string file_2  = FileHandler.Combine(testFolder,"copy", "folder1", "file_2");
		string file_1_content = "file1Content";
		string file_2_content = "file2Content";

		await FileHandler.mkdir		( folder1 );
		await FileHandler.saveFile	( file_1 , file_1_content );
		await FileHandler.saveFile	( file_2 , file_2_content );

		// folder level 2
		string folder2 = FileHandler.Combine(testFolder,"copy", "folder1", "folder2");
		string file_21 = FileHandler.Combine(testFolder,"copy", "folder1", "folder2", "file_1");
		string file_22 = FileHandler.Combine(testFolder,"copy", "folder1", "folder2", "file_2");
		string file_21_content = "file21Content";
		string file_22_content = "file22Content";

		await FileHandler.mkdir		( folder2 );
		await FileHandler.saveFile	( file_21 , file_21_content );
		await FileHandler.saveFile	( file_22 , file_22_content );

		string target_folder1 = FileHandler.Combine(testFolder,"copy", "target");
		string target_file_1  = FileHandler.Combine(testFolder,"copy", "target", "file_1");
		string target_file_2  = FileHandler.Combine(testFolder,"copy", "target", "file_2");
		string target_folder2 = FileHandler.Combine(testFolder,"copy", "target", "folder2");
		string target_file_21 = FileHandler.Combine(testFolder,"copy", "target", "folder2", "file_1");
		string target_file_22 = FileHandler.Combine(testFolder,"copy", "target", "folder2", "file_2");
		
		// COPY 
		await FileHandler.copy(folder1,target_folder1);
		
		// ensure folders exists
		Assert.IsTrue	( await FileHandler.exists(target_folder1) );
		Assert.IsTrue	( await FileHandler.exists(target_folder2) );
		// ensure that files exists and that contents are equivalent. 		
		Assert.AreEqual	( await FileHandler.readFile(target_file_1 ) , file_1_content );
		Assert.AreEqual	( await FileHandler.readFile(target_file_2 ) , file_2_content ); 
		Assert.AreEqual	( await FileHandler.readFile(target_file_21) , file_21_content );
		Assert.AreEqual	( await FileHandler.readFile(target_file_22) , file_22_content ); 

		await FileHandler.rm(target_folder1);
		await FileHandler.rm(folder1);
		await FileHandler.rm( FileHandler.Combine(testFolder,"copy"));
	}
		
}
 