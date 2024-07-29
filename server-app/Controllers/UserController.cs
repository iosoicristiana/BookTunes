using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Routing;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using server_app.Data;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text.Json;

namespace server_app.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : Controller
    {

        private readonly ApplicationDbContext _dbContext;
        
        public UserController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpGet("getToken")]
        [Authorize]
        public async Task<IActionResult> GetToken()
        {
            //extract the user id from the token
            var userSpotifyId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userSpotifyId))
            {
                return Unauthorized("Invalid token or user not found");
            }

            var SpotifyAccessToken = await _dbContext.Users.AsNoTracking().Where(u => u.SpotifyId == userSpotifyId).Select(u => u.AccessToken).FirstOrDefaultAsync();

            if(string.IsNullOrEmpty(SpotifyAccessToken))
            {
                return BadRequest("No Spotify Acces Token");
            }
            Console.WriteLine(SpotifyAccessToken);

            return Ok(new { AccessToken = SpotifyAccessToken });
        }

        [HttpGet("getProfile")]
        [Authorize]
        public async Task<IActionResult> GetProfile()
        {
            //extract the user id from the token
            var userSpotifyId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userSpotifyId))
            {
                return Unauthorized("Invalid token or user not found");
            }

            Console.WriteLine(userSpotifyId);

            var SpotifyAccessToken = await _dbContext.Users.AsNoTracking().Where(u => u.SpotifyId == userSpotifyId).Select(u => u.AccessToken).FirstOrDefaultAsync();

            if(string.IsNullOrEmpty(SpotifyAccessToken))
            {
                return BadRequest("No Spotify Acces Token");
            }

            var httpClient = new HttpClient();
            httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", SpotifyAccessToken);
            var response = await httpClient.GetAsync("https://api.spotify.com/v1/me");

            if(response.IsSuccessStatusCode)
            {
                //send the json to the client
                string jsonContent = await response.Content.ReadAsStringAsync();
                var profileData = JsonConvert.DeserializeObject<SpotifyUser>(jsonContent);
                return Ok(profileData);

            }
            else
            {
                return BadRequest("Failed to fetch user profile");
            }

        }
    }
}
