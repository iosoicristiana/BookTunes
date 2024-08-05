using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using server_app.Data;
using server_app.Models;
using server_app.Models.DTOs;
using System.Drawing.Printing;
using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text;
using System.Web;

public class SpotifyService
{
    private readonly HttpClient _httpClient;
    private readonly IConfiguration _configuration;
    private readonly ApplicationDbContext _dbContext;

    public SpotifyService(HttpClient httpClient, IConfiguration configuration, ApplicationDbContext dbContext)
    {
        _httpClient = httpClient;
        _configuration = configuration;
        _dbContext = dbContext;
    }

    public async Task<AuthResult> ExchangeCodeForTokensAsync(string code)
    {
        Console.WriteLine($"Exchanging code for tokens: {code}");
        var requestBody = new Dictionary<string, string>
        {
            { "grant_type", "authorization_code" },
            { "code", code },
            { "redirect_uri", _configuration["Spotify:RedirectUri"] },
            { "client_id", _configuration["Spotify:ClientId"] },
            { "client_secret", _configuration["Spotify:ClientSecret"] }
        };

        HttpResponseMessage response = await _httpClient.PostAsync("https://accounts.spotify.com/api/token", new FormUrlEncodedContent(requestBody));
        if (response.IsSuccessStatusCode)
        {
            var jsonContent = await response.Content.ReadAsStringAsync();
            var tokenData = JsonConvert.DeserializeObject<SpotifyTokenData>(jsonContent);
            return new AuthResult { IsSuccess = true, AccessToken = tokenData.AccessToken };
        }

        var errorContent = await response.Content.ReadAsStringAsync();
        return new AuthResult { IsSuccess = false, ErrorMessage = errorContent };
    }

    public async Task<SpotifyUser> FetchAndUpdateUserProfile(string accessToken)
    {
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
        HttpResponseMessage response = await _httpClient.GetAsync("https://api.spotify.com/v1/me");
        if (response.IsSuccessStatusCode)
        {
            var jsonContent = await response.Content.ReadAsStringAsync();
            JObject userJson = JObject.Parse(jsonContent);

            SpotifyUser user = new SpotifyUser
            {
                Id = (string)userJson["id"],
                DisplayName = (string)userJson["display_name"],
                Email = (string)userJson["email"]
                // Add other fields as necessary
            };

            Console.WriteLine($"User: {user.Id} {user.DisplayName} ({user.Email})");

            return user;
        }
        else
        {
            var errorContent = await response.Content.ReadAsStringAsync();
            Console.WriteLine($"Failed to fetch user profile. Status Code: {response.StatusCode}. Response: {errorContent}");
            return null;
        }
    }

    public async Task SaveOrUpdateUser(SpotifyUser userInfo, string accessToken, string refreshToken)
    {
        var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.SpotifyId == userInfo.Id);
        if (user == null)
        {
            Console.WriteLine("User not found, creating new user");
            user = new User
            {
                SpotifyId = userInfo.Id,
                Email = userInfo.Email,
                DisplayName = userInfo.DisplayName,
                AccessToken = accessToken,
                RefreshToken = refreshToken
            };
            _dbContext.Users.Add(user);
        }
        else
        {
            Console.WriteLine("Updating existing user's tokens");
            user.DisplayName = userInfo.DisplayName;
            user.AccessToken = accessToken;
            user.RefreshToken = refreshToken;
            _dbContext.Update(user);

        }
        await _dbContext.SaveChangesAsync();
    }

    public string GenerateJwtToken(string userId)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_configuration["Jwt:Secret"]);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(new Claim[]
            {
                new Claim(ClaimTypes.NameIdentifier, userId)
            }),
            Expires = DateTime.UtcNow.AddHours(1),
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }



    public class SpotifyTokenData
    {
        public string AccessToken { get; set; }
        public string TokenType { get; set; }
        public int ExpiresIn { get; set; }
        public string RefreshToken { get; set; }
        public string Scope { get; set; }
    }

    public class AuthResult
    {
        public bool IsSuccess { get; set; }
        public string AccessToken { get; set; }
        public string ErrorMessage { get; set; }
    }



    public async Task<JArray> GetRecommendations(string userId, List<String> seedGenres,double ratio, double valence, double arousal, double dominance)
    {
        var acccesToken = await _dbContext.Users.Where(u => u.Id == userId).Select(u => u.AccessToken).FirstOrDefaultAsync();
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", acccesToken);

        var genreQuery = string.Join(",", seedGenres);
        var encodedGenreQuery = HttpUtility.UrlEncode(genreQuery);

        //loudness???maybe dupa dominance
        //var danceability = arousal;
        var mode = 0;
        if (ratio > 1)
            mode = 1;
        var tempo = 60 + arousal * 40;
        var energy = dominance;
        //valenta ramane = valence;

        //formatam in string-uri cu 2 zecimale pt request
        string formattedValence = valence.ToString("F2"); // F2 format specifier for 2 decimal places
        string formattedEnergy = energy.ToString("F2");
        string formattedTempo = tempo.ToString("F2");
        //string formattedDanceability = danceability.ToString("F2");

        ///transform dominance (from 0 to 1) to a range 

        Console.WriteLine($"Getting recommendations for genres: {genreQuery}, valence: {formattedValence}, energy: {formattedEnergy}, tempo: {formattedTempo}, mode: {mode}");


        var response = await _httpClient.GetAsync($"https://api.spotify.com/v1/recommendations?limit=20&seed_genres={encodedGenreQuery}&target_valence={formattedValence}&target_energy={formattedEnergy}&target_tempo={formattedTempo}&target_mode={mode}");
           
        if (response.IsSuccessStatusCode)
        {
               
            var jsonContent = await response.Content.ReadAsStringAsync();
            var recommendations = JObject.Parse(jsonContent)["tracks"] as JArray;
            return recommendations;
        }
        else
        {
            Console.WriteLine($"Failed to fetch recommendations. Status Code: {response.StatusCode}");
            return null;
        }

    }

    public async Task<string> CreatePlaylist(string userId, string PlaylistName, string playlistDescription)
    {
        var acccesToken = await _dbContext.Users.Where(u => u.SpotifyId == userId).Select(u => u.AccessToken).FirstOrDefaultAsync();
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", acccesToken);
        var requestBody = new
        {
            name = PlaylistName,
            description = playlistDescription,
            @public = true
        };

        var content = new StringContent(JsonConvert.SerializeObject(requestBody), Encoding.UTF8, "application/json");

      

        var response = await _httpClient.PostAsync($"https://api.spotify.com/v1/users/{userId}/playlists", content);
        if (response.IsSuccessStatusCode)
        {
            var jsonContent = await response.Content.ReadAsStringAsync();
            var playlistId = JObject.Parse(jsonContent)["id"].ToString();
            return playlistId;
        }
        else
        {
            Console.WriteLine($"Failed to create playlist. Status Code: {response.StatusCode}");
            return null;
        }
    }

    public async Task AddTracksToPlaylist(string playlistId, IEnumerable<string> trackUris, string userId)
    {
        var acccesToken = await _dbContext.Users.Where(u => u.Id == userId).Select(u => u.AccessToken).FirstOrDefaultAsync();
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", acccesToken);
        var requestBody = new
        {
            uris = trackUris
        };

        var content = new StringContent(JsonConvert.SerializeObject(requestBody), Encoding.UTF8, "application/json");

        var response = await _httpClient.PostAsync($"https://api.spotify.com/v1/playlists/{playlistId}/tracks", content);
        if (!response.IsSuccessStatusCode)
        {
            Console.WriteLine($"Failed to add tracks to playlist. Status Code: {response.StatusCode}");
        }
    }

    public async Task<List<Track>> GetPlaylistTracks(string playlistId, string userSpotifyId)
    {
        var accessToken = await _dbContext.Users.Where(u => u.SpotifyId == userSpotifyId).Select(u => u.AccessToken).FirstOrDefaultAsync();
        _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

        var response = await _httpClient.GetAsync($"https://api.spotify.com/v1/playlists/{playlistId}/tracks");
        if (response.IsSuccessStatusCode)
        {
            var jsonContent = await response.Content.ReadAsStringAsync();
            var trackData = JObject.Parse(jsonContent)["items"] as JArray;

            var tracks = trackData.Select(track => new Track
            {
                Id = track["track"]["id"].ToString(),
                Name = track["track"]["name"].ToString(),
                Artists = string.Join(", ", track["track"]["artists"].Select(a => a["name"].ToString())),
                Album = track["track"]["album"]["name"].ToString(),
                Duration = (int)track["track"]["duration_ms"],
                SpotifyUrl = track["track"]["external_urls"]["spotify"].ToString(),
            }).ToList();

            return tracks;
        }

        return new List<Track>();
    }

}
