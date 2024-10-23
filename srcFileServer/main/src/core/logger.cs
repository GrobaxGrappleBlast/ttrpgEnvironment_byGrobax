public class Logger
{
    private static readonly string errorLogFilePath = "error_log.txt"; // Define log file path
	private static readonly string verboseLogFilePath = "verbose_log.txt"; // Define log file path

    // Method to log the error
	public static void LogError( Exception ex , string context = "" )
	{
		using (StreamWriter writer = new StreamWriter(errorLogFilePath, true))
		{
			writer.WriteLine("----- Error Log -----");
			writer.WriteLine($"Timestamp: {DateTime.Now}");
			writer.WriteLine($"Error Message: {ex.Message}");
			writer.WriteLine($"Stack Trace: {ex.StackTrace}");
			writer.WriteLine(context);
			writer.WriteLine("---------------------");
			writer.WriteLine(); 
		}
	}

	public static void LogVerbose( string Message = "" )
	{
		using (StreamWriter writer = new StreamWriter(verboseLogFilePath, true))
		{
			writer.WriteLine("----- Message Log -----");
			writer.WriteLine($"Timestamp: {DateTime.Now}");
			writer.WriteLine($"Message: {Message}");  
			writer.WriteLine(); 
		}
	}
}