using Microsoft.AspNetCore.Mvc;

namespace srcServer.Controllers
{
	[ApiController]
	[Route("api/systemDefinitions")]
	public class SystemDefinitions : ControllerBase
	{
		[HttpGet]
		[Route("allSystems")]
		public IActionResult GetAllSystems()
		{
			return Ok( "" );
		}

		[HttpGet]
		[Route("system")]
		public IActionResult getOrCreateSystem()
		{
			return Ok( "" );
		}

		[HttpPut]
		[Route("system")]
		public IActionResult EditSystem()
		{
			return Ok( "" );
		}

		[HttpDelete]
		[Route("system")]
		public IActionResult DeleteSystem()
		{
			return Ok( "" );
		}

		[HttpPut]
		[Route("system/copy")]
		public IActionResult CopySystem()
		{
			return Ok( "" );
		}

	}
}