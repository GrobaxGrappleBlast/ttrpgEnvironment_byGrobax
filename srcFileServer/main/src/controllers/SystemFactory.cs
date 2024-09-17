using Microsoft.AspNetCore.Mvc;

namespace srcServer.Controllers
{
	[ApiController]
	[Route("api/SystemFactory")]
	public class SystemFactory : ControllerBase
	{
		[HttpGet] 
		public IActionResult getOrCreateSystemFactory()
		{
			  return Ok( "" );
		}

		[HttpPut] 
		public IActionResult saveSystemFactory()
		{
			return Ok( "" );
		}

	}
}