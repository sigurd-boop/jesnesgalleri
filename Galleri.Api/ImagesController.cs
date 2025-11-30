using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace Galleri.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ImagesController : ControllerBase
    {
        private readonly ILogger<ImagesController> _logger;

        public ImagesController(ILogger<ImagesController> logger)
        {
            _logger = logger;
        }

        // This endpoint is for anyone to view images. No authorization is needed.
        [HttpGet]
        public IActionResult GetImages()
        {
            _logger.LogInformation("Public endpoint /api/images was accessed.");
            // In a real application, you would fetch image data from your database here.
            return Ok(new { message = "This is a public endpoint. Here are the images." });
        }

        // This endpoint is protected. Only the admin can access it.
        [HttpPost("upload")]
        [Authorize(Policy = "IsAdmin")]
        public IActionResult UploadImage()
        {
            var adminUid = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            _logger.LogInformation("Secure endpoint /api/images/upload was accessed by admin: {AdminUid}", adminUid);
            // Your logic to handle the actual image upload goes here.
            return Ok(new { message = $"Image uploaded successfully by admin {adminUid}." });
        }
    }
}