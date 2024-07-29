using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using server_app.Data;
using server_app.Models.DTOs;
using server_app.Services;
using System.Security.Claims;

namespace server_app.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class PlaylistController : Controller
    {
        private readonly SpotifyService _spotifyService;
        private readonly ApplicationDbContext _dbContext;
        private readonly PlaylistService _playlistService;

        public  PlaylistController(SpotifyService spotifyService, ApplicationDbContext dbContext, PlaylistService playlistService)
        {
            _spotifyService = spotifyService;
            _dbContext = dbContext;
            _playlistService = playlistService;
        }

        [HttpPost("generate")]
        [Authorize]
        public async Task<IActionResult> GeneratePlaylist([FromBody] GutenbergBook gutenbergBook)
        {
            var userSpotifyId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userSpotifyId))
            {
                return Unauthorized("Invalid token or user not found");
            }

            var user = await _dbContext.Users.AsNoTracking().Where(u => u.SpotifyId == userSpotifyId).FirstOrDefaultAsync();

            if (user == null)
            {
                return BadRequest("User not found");
            }

            var book = await _dbContext.Books.FirstOrDefaultAsync(b => b.GutenbergId == gutenbergBook.Id);
            if (book == null)
            {
                return BadRequest("Book not found");
            }

            try
            {

                Console.WriteLine("Generating playlist for book: " + book.Title);
                var playlist = await _playlistService.GeneratePlaylistForBook(user.Id, book.Id);

                return Ok(playlist);
            }
            catch (Exception e)
            {
                return BadRequest(e.Message);
            }


        }

        [HttpGet("getPlaylist")]
        [Authorize]
        public async Task<IActionResult> GetAPlaylist(string id)
        {
            var userSpotifyId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userSpotifyId))
            {
                return Unauthorized("Invalid token or user not found");
            }

            var user = await _dbContext.Users.AsNoTracking().Where(u => u.SpotifyId == userSpotifyId).FirstOrDefaultAsync();

            if (user == null)
            {
                return BadRequest("User not found");
            }

            var playlist = await _dbContext.Playlists.AsNoTracking().Where(p => p.Id == id).FirstOrDefaultAsync();

            if (playlist == null)
            {
                return BadRequest("Playlist not found");
            }

            return Ok(playlist);
        }



        [HttpGet("get")]
        [Authorize]
        public async Task<IActionResult> GetAllPlaylists()
        {
            var userSpotifyId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userSpotifyId == null)
            {
                return Unauthorized("Invalid token or user not found");
            }

            var user = await _dbContext.Users
                                       .Where(u => u.SpotifyId == userSpotifyId)
                                       .Include(u => u.Playlists)
                                       .ThenInclude(p => p.Book)
                                       .FirstOrDefaultAsync();

            if (user == null)
            {
                return BadRequest("User not found");
            }

            var playlists = user.Playlists.Select(p => new PlaylistDto
            {
                SpotifyPlaylistId = p.Id,
                Name = p.Name,
                Description = p.Description,
                SpotifyUrl = p.SpotifyUrl
            }).ToList();

            return Ok(playlists);
        }

        [HttpGet("getbyBook/{gutenbergId}")]
        [Authorize]
        public async  Task<IActionResult> GetPlaylistsByBook(int gutenbergId)
        {
            var userSpotifyId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userSpotifyId == null)
            {
                return Unauthorized("Invalid token or user not found");
            }

            var user = await _dbContext.Users
                                       .Where(u => u.SpotifyId == userSpotifyId)
                                       .Include(u => u.Playlists)
                                       .ThenInclude(p => p.Book)
                                       .FirstOrDefaultAsync();

            if (user == null)
            {
                return BadRequest("User not found");
            }

            var playlists = user.Playlists.Where(p => p.Book.GutenbergId == gutenbergId).Select(p => new PlaylistDto
            {
                SpotifyPlaylistId = p.Id,
                Name = p.Name,
                Description = p.Description,
                SpotifyUrl = p.SpotifyUrl
            }).ToList();

            if (playlists == null || !playlists.Any())
            {
                return NotFound("No playlists found for this book.");
            }


            return Ok(playlists);


        }   
    }
}
