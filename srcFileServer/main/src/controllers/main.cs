using Microsoft.AspNetCore.Mvc;

namespace srcServer.Controllers
{
    [ApiController]
    [Route("api/")]
    public class mainController : ControllerBase
    {
        [HttpGet]
        public IActionResult Get()
        {
			string path = Path.Combine( Directory.GetCurrentDirectory() , "../Systems" );
			string fullPath = Path.GetFullPath(path);
            return Ok( fullPath );
        }
    }
}