public class Logger
{
    private static readonly string logFilePath = "error_log.txt"; // Define log file path

    // Method to log the error
	public static void LogError( Exception ex , string context = "" )
	{
		using (StreamWriter writer = new StreamWriter(logFilePath, true))
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
}