
public class TTRPGSystemException: Exception
{
    // Default constructor
    public TTRPGSystemException() : base() { }

    // Constructor with error message
    public TTRPGSystemException(string message) : base(message) { }

    // Constructor with error message and inner exception
    public TTRPGSystemException(string message, Exception innerException): base(message, innerException) { }
 
}