using Microsoft.AspNetCore.Mvc;

namespace srcServer.Controllers
{
	[ApiController]
	[Route("api/SystemUI")]
	public class SystemUIImporterExporter : ControllerBase
	{
		[HttpGet] 
		[Route("all")]
		public IActionResult getOrCreateSystemFactory()
		{
			return Ok( "" );
		}

		[HttpGet] 
		[Route("export")]
		public IActionResult saveSystemFactory()
		{
			return Ok( "" );
		}

	}
}