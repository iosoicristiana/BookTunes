using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json;
using server_app.Data;
using server_app.Models;
using server_app.Models.DTOs;
using System.Drawing.Printing;
using System.Security.Claims;
using System.Text.Json;


namespace server_app.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookController : Controller
    {
        private readonly ApplicationDbContext _dbContext;

        public BookController(ApplicationDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        [HttpPost("add")]
        [Authorize]
        public async Task<IActionResult> AddBook([FromBody] GutenbergBook gutenbergBook)
        {
            var userSpotifyId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userSpotifyId))
            {
                return Unauthorized("Invalid token or user not found");
            }

            var user = await _dbContext.Users
                                       .Include(u => u.FavoriteBooks)
                                       .FirstOrDefaultAsync(u => u.SpotifyId == userSpotifyId);

            if (user == null)
            {
                return BadRequest("User not found");
            }

            var book = await _dbContext.Books.FirstOrDefaultAsync(b => b.GutenbergId == gutenbergBook.Id);
            Console.WriteLine(book);    
            if (book == null)
            {
                Console.WriteLine("Book not found in the database");
                book = new Book
                {
                    GutenbergId = gutenbergBook.Id,
                    Title = gutenbergBook.Title,
                    Author = gutenbergBook.Authors.FirstOrDefault()?.Name,
                    Formats = JsonConvert.SerializeObject(gutenbergBook.Formats),
                    Subjects = JsonConvert.SerializeObject(gutenbergBook.Subjects),
                    Bookshelves = JsonConvert.SerializeObject(gutenbergBook.Bookshelves),
                   SentimentData = "{}"
                };

                await _dbContext.Books.AddAsync(book);
                await _dbContext.SaveChangesAsync();
                Console.WriteLine("Book added to the database");
                
            }
            else
            {
                Console.WriteLine("Book already exists in the database");
                Console.WriteLine(gutenbergBook.Subjects);
                book.Subjects = JsonConvert.SerializeObject(gutenbergBook.Subjects);
                book.Bookshelves = JsonConvert.SerializeObject(gutenbergBook.Bookshelves);

                _dbContext.Books.Update(book);
                await _dbContext.SaveChangesAsync();
            }


            var userBook = await _dbContext.UserBooks
                                            .FirstOrDefaultAsync(ub => ub.UserId == user.Id && ub.BookId == book.Id);

            if (userBook == null)
            {
                userBook = new UserBook
                {
                    UserId = user.Id,
                    BookId = book.Id,
                };

                await _dbContext.UserBooks.AddAsync(userBook);
                await _dbContext.SaveChangesAsync();
            }

            return Ok();
        }

        [HttpPost("remove/{gutenbergId}")]
        [Authorize]
        public async Task<IActionResult> RemoveBook(int gutenbergId)
        {
            Console.WriteLine("Received Gutenberg ID: " + gutenbergId);

            var userSpotifyId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userSpotifyId))
            {
                return Unauthorized("Invalid token or user not found");
            }

            var user = await _dbContext.Users
                                       .Include(u => u.FavoriteBooks)
                                       .FirstOrDefaultAsync(u => u.SpotifyId == userSpotifyId);

            if (user == null)
            {
                return BadRequest("User not found");
            }

            var book = await _dbContext.Books.FirstOrDefaultAsync(b => b.GutenbergId == gutenbergId);

            if (book == null)
            {
                return NotFound("Book not found in the database");
            }

            var userBook = await _dbContext.UserBooks
                                            .FirstOrDefaultAsync(ub => ub.UserId == user.Id && ub.BookId == book.Id);

            if (userBook == null)
            {
                return NotFound("The book is not in the user's favorites");
            }

            if (userBook != null)
            {
                Console.WriteLine("Removing book from favorites");
                _dbContext.UserBooks.Remove(userBook);
                await _dbContext.SaveChangesAsync();
            }
            else
            {
                return NotFound("The book is not in the user's favorites");
            }

            Console.WriteLine("Book removed from favorites");
            return Ok("Book removed successfully from favorites");
        }



        [HttpGet("getBooks")]
        [Authorize]
        public async Task<IActionResult> GetFavorites()
        {
            var userSpotifyId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if(userSpotifyId == null)
            {
                return Unauthorized("Invalid token or user not found");
            }

            var user = await _dbContext.Users.
                Where(u => u.SpotifyId == userSpotifyId)
                .Include(u => u.FavoriteBooks)
                .ThenInclude(ub => ub.Book)
                .FirstOrDefaultAsync();

            if(user == null)
            {
                return BadRequest("User not found");
            }

            var favoriteBooks = user.FavoriteBooks.Select(ub => new GutenbergBook
            {
                Id = ub.Book.GutenbergId,
                Title = ub.Book.Title,
                Authors = new List<AuthorGutenberg> { new AuthorGutenberg { Name = ub.Book.Author } },
                Formats = JsonConvert.DeserializeObject<Dictionary<string, string>>(ub.Book.Formats)
            }
            
            ).ToList();

            Console.WriteLine(favoriteBooks.Count);

            

            return Ok(favoriteBooks);
        }
    }
}
