using Microsoft.AspNetCore.Identity;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;
using server_app.Data;
using server_app.Models;
using server_app.Models.DTOs;
using System.Drawing.Printing;
using System.Net.Http;
using System.Net.Http.Json;


namespace server_app.Services
{
    public class PlaylistService
    {

        private readonly ApplicationDbContext _context;
        private readonly HttpClient httpClient;
        private readonly SpotifyService _spotifyService;

        public PlaylistService(ApplicationDbContext context, HttpClient httpClient, SpotifyService spotifyService)
        {
            _context = context;
            this.httpClient = httpClient;
            _spotifyService = spotifyService;
        }

        public async Task<SentimentData> GetSentimentScores(string textUrl, int bookId)
        {
            using (var httpClient = new HttpClient())
            {

                httpClient.Timeout = TimeSpan.FromMinutes(7);

                try
                {
                    var response = await httpClient.PostAsJsonAsync("https://9780-34-126-108-236.ngrok-free.app/analyze", new { url = textUrl });
                    response.EnsureSuccessStatusCode();

                    var jsonContent = await response.Content.ReadAsStringAsync();
                    var sentimentData = JsonConvert.DeserializeObject<SentimentData>(jsonContent);

                    // Retrieve the book from the database
                    var book = _context.Books.FirstOrDefault(b => b.Id == bookId);
                    if (book != null)
                    {
                        // Convert sentiment data to JSON string or a suitable format to save in the database
                        book.SentimentData = jsonContent;
                        _context.Update(book);
                        await _context.SaveChangesAsync();
                    }
                    else
                    {
                        Console.WriteLine("Book not found in database.");
                    }

                    return sentimentData;
                }
                catch (HttpRequestException e)
                {
                    Console.WriteLine($"Error fetching sentiment scores: {e.Message}");
                    throw;
                }
                catch (TaskCanceledException ex)
                {
                    Console.WriteLine("Request timed out: " + ex.Message);
                    // Handle the timeout appropriately
                    return null;
                }
            }
        }

        public List<string> GetGenresFromEmotions(List<string> emotions, List<string> categories)
        {
            var genreSet = new HashSet<string>(); // evitam duplicatele
            foreach (var emotion in emotions)
            {
                string genre = EmotionToGenreMapper.GetGenreForEmotion(emotion);
                if (!string.IsNullOrEmpty(genre))
                {
                    genreSet.Add(genre);
                }
            }

            var genreFrequency = new Dictionary<string, int>();
            foreach (var category in categories)
            {
              
               List<string> genres = SubjectToGenreMapper.GetGenresForSubject(category);
               Console.WriteLine($"Processing category: {category}. Found genres: {string.Join(", ", genres)}");
                
               foreach (var genre in genres)
                {
                   if (genreFrequency.ContainsKey(genre))
                    {
                        genreFrequency[genre]++;
                   }
                   else
                    {
                        genreFrequency[genre] = 1;
                   }
               }

            }

            var sortedGenres = genreFrequency.OrderByDescending(pair => pair.Value).Select(pair => pair.Key).ToList();
            var topGenres = sortedGenres.Take(2).ToList();
            genreSet.UnionWith(topGenres);
            return genreSet.ToList();
        }

       




        public async Task<Playlist> GeneratePlaylistForBook(string userId, int bookId, PlaylistGenerationRequest request)
        {
            var user = _context.Users.FirstOrDefault(u => u.Id == userId);
            var book = _context.Books.FirstOrDefault(b => b.Id == bookId);

            if (user == null || book == null)
            {
                throw new Exception("User or book not found");
            }


            SentimentData sentimentData;

            // verifcam daca avem deja datele de sentiment pentru cartea respectiva
            // oricum textul nu se schimba, deci nu e nevoie sa le calculam de fiecare data
            if ((!string.IsNullOrEmpty(book.SentimentData)) && (book.SentimentData != "{}"))
            {
                sentimentData = JsonConvert.DeserializeObject<SentimentData>(book.SentimentData);
                Console.WriteLine("Sentiment data fetched from database");
                Console.WriteLine(sentimentData);
            }
            else
            {
                JObject formats = JObject.Parse(book.Formats);
                string textUrl = formats["text/plain; charset=us-ascii"].ToString();
                sentimentData = await GetSentimentScores(textUrl, bookId);
                Console.WriteLine("Sentiment data fetched from API");
                Console.WriteLine(sentimentData);
            }



            //concat the individual subjects and bookshelves into one list
            var subjects = JsonConvert.DeserializeObject<List<string>>(book.Subjects) ?? new List<string>();
            var bookshelves = JsonConvert.DeserializeObject<List<string>>(book.Bookshelves) ?? new List<string>();

            // Combine subjects and bookshelves
            subjects.AddRange(bookshelves);

            List<String> seedGenres = GetGenresFromEmotions(sentimentData.Emotions, subjects);

            if (request.SoundtrackType == "Classical")
            {
                seedGenres = new List<string> { "classical" };
            }

            // checking if the user has a popularity preference, we will add this to the request

            // checking if there are decades preferences, we will filter the recommendations at the end based on this

            //checking if they want to include their spotify prefereneces -> we will extract a song from their top stats and use it as a seed

            //momentan doar le afisam in consola sa stiu ca exista 
            Console.WriteLine(request.PopularityRange);
            Console.WriteLine(request.Decades);
            Console.WriteLine(request.UseSpotifyPreferences);


            Console.WriteLine(seedGenres);

            List<string> allTrackUris = new List<string>();

            for (int i = 0; i < sentimentData.VAD.windowed_valence.Count; i++)
            {
                double windowValence = sentimentData.VAD.windowed_valence[i];
                double windowArousal = sentimentData.VAD.windowed_arousal[i];
                double windowDominance = sentimentData.VAD.mean_dominance;
                if(i > sentimentData.VAD.windowed_domninance.Count)
                    windowDominance = sentimentData.VAD.windowed_domninance[i];
                double ratio = sentimentData.VAD.ratio;
                Console.WriteLine($"Window {i}: Valence {windowValence}, Arousal {windowArousal}");
                //string seedGenre = (windowValence > 0.7) ? "pop" : (windowValence < 0.3) ? "blues" : "classical";
                
                var recommendations = await _spotifyService.GetRecommendations(userId, seedGenres, ratio, windowValence, windowArousal, windowDominance);
                if (recommendations != null)
                {
                    Console.WriteLine($"Recommendations for window {i}:");
                    allTrackUris.AddRange(recommendations.Select(track => track["uri"].ToString()).Take(15));
                    Console.WriteLine(string.Join(", ", allTrackUris));
                }
            }

            //var recommendations = await _spotifyService.GetRecommendations(userId, seedGenre);
           var trackUris = allTrackUris.Distinct().Take(100).ToList();
            var Desription = $"A playlist based on the book {book.Title}";
            var playlistId = await _spotifyService.CreatePlaylist(user.SpotifyId, book.Title, Desription);
            await _spotifyService.AddTracksToPlaylist(playlistId, trackUris, userId);

            var playlist = new Playlist
            {
                Id = playlistId,
                SpotifyUrl = $"https://open.spotify.com/playlist/{playlistId}",
                Name = book.Title,
                Description = $"A playlist based on the book {book.Title}",
                Book = book,
                User = user
            };

            _context.Playlists.Add(playlist);
            await _context.SaveChangesAsync();

            return playlist;
        }




    }
}
