using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using server_app.Models.DTOs;
using System.Net.Http;
using System.Security.Claims;
using System.Text.Json;

namespace server_app.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {

        private readonly SpotifyService _spotifyService;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthController> _logger;

        public AuthController(SpotifyService spotifyService, IConfiguration configuration, ILogger<AuthController> logger)
        {
            _spotifyService = spotifyService;
            _configuration = configuration;
            _logger = logger;
        }


        [HttpGet("login")]
        public IActionResult Login()
        {
            Console.WriteLine("Login");
            return Challenge(new AuthenticationProperties { RedirectUri = "/" }, "Spotify");
        }

        //[HttpGet("callback")]
        //public async Task<IActionResult> Callback()
        //{

        //    var authenticateResult = await HttpContext.AuthenticateAsync("Spotify");
        //    if(!authenticateResult.Succeeded)
        //    {
        //        return BadRequest("Authentication failed");
        //    }

        //    return Redirect("http://localhost:3000/");


        //    //Console.WriteLine($"Code: {code}");
        //    //if(string .IsNullOrEmpty(code))
        //    //{
        //    //    return BadRequest("Code is required");
        //    //}

        //    //var tokenResponse = _spotifyService.ExchangeCodeForTokensAsync(code).Result;

        //    //if (!tokenResponse.IsSuccess)
        //    //{
        //    //    return BadRequest(tokenResponse.ErrorMessage);
        //    //}
        //    //else
        //    //{
        //    //    return Redirect("http://localhost:3000/");
        //    //}


        //}


        [HttpPost("getToken")]
        public async Task<IActionResult> GetToken([FromBody] CodeRequest spotifyCode)
        {
            _logger.LogInformation("Received getToken request");
            Console.WriteLine("spotifyCode", spotifyCode);
            if (spotifyCode == null || string.IsNullOrEmpty(spotifyCode.Code))
            {
                return BadRequest("Invalid Spotify code.");
            }

            try
            {
                _logger.LogInformation($"Code: {spotifyCode.Code}");
                using (var httpClient = new HttpClient())
                {
                    var requestBody = new Dictionary<string, string>
            {
                { "grant_type", "authorization_code" },
                { "code", spotifyCode.Code },
                { "redirect_uri", "http://localhost:3000/callback" },
                { "client_id", _configuration["Spotify:ClientId"] },
                { "client_secret", _configuration["Spotify:ClientSecret"] }
            };

                    var request = new HttpRequestMessage(HttpMethod.Post, "https://accounts.spotify.com/api/token")
                    {
                        Content = new FormUrlEncodedContent(requestBody)
                    };

                    var response = await httpClient.SendAsync(request);


       
                    if (response.IsSuccessStatusCode)
                    {
                        var jsonString = await response.Content.ReadAsStringAsync();
                        
                        var tokenResponse = JsonSerializer.Deserialize<SpotifyTokenResponse>(jsonString);

                        SpotifyUser userInfo = await _spotifyService.FetchAndUpdateUserProfile(tokenResponse.AccessToken);
                        await _spotifyService.SaveOrUpdateUser(userInfo, tokenResponse.AccessToken, tokenResponse.RefreshToken);

                        var jwtToken = _spotifyService.GenerateJwtToken(userInfo.Id);
                        return Ok(new { token = jwtToken });
                    }
                    else
                    { 
                        var errorContent = await response.Content.ReadAsStringAsync();
                        _logger.LogError($"Failed to get token from Spotify. Status Code: {response.StatusCode}, Response: {errorContent}");
                        return StatusCode((int)response.StatusCode, "Failed to get token from Spotify.");
                    }
                }
            }
            catch (Exception ex)
            {
              
                return StatusCode(500, "An internal server error occurred.");
            }
        }

        [HttpPost("test")]
        public IActionResult SimpleTest([FromBody] CodeRequest spotifyCode)
        {
            Console.WriteLine($"Code Received: {spotifyCode?.Code}");
            return Ok("Request Received");
        }



        [HttpGet("logout")]
        public async Task<IActionResult> Logout()
        {
         
            await HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            return SignOut(new AuthenticationProperties { RedirectUri = "/" }, "Cookies");
        }

    }
}
