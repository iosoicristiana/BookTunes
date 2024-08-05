using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
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

        [HttpGet("setTokenCookie")]
        [Authorize]
        public async Task<IActionResult> SetTokenCookie()
        {
            var userSpotifyId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userSpotifyId))
            {
                return Unauthorized("Invalid token or user not found");
            }

            var user = await _dbContext.Users.AsNoTracking().Where(u => u.SpotifyId == userSpotifyId).FirstOrDefaultAsync();

            if (user == null)
            {
                return BadRequest("User not found");
            }

            var accessToken = user.AccessToken;

            if (string.IsNullOrEmpty(accessToken))
            {
                return NotFound("Access token not found");
            }

            var cookieOptions = new CookieOptions
            {
                HttpOnly = true,
                Secure = true,
                SameSite = SameSiteMode.None // Needed for cross-site cookies
            };

            Response.Cookies.Append("SpotifyAccessToken", accessToken, cookieOptions);

            return Ok(new { message = "Access token set in cookie" });


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
