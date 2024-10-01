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

                httpClient.Timeout = TimeSpan.FromMinutes(20);

                try
                {
                    var response = await httpClient.PostAsJsonAsync("https://61a6-34-125-137-56.ngrok-free.app/analyze", new { url = textUrl });
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
                    Console.WriteLine(e.StackTrace);
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
            var topGenres = sortedGenres.Take(3).ToList();
            genreSet.UnionWith(topGenres);
            return genreSet.ToList();
        }

        public static double[] MinMaxNormalize(double[] values)
        {
            double minVal = values.Min();
            double maxVal = values.Max();
            return values.Select(x => (maxVal - minVal) == 0 ? 0 : (x - minVal) / (maxVal - minVal)).ToArray();
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

            // Check if sentiment data already exists for the book
            if (!string.IsNullOrEmpty(book.SentimentData) && book.SentimentData != "{}")
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

            var subjects = JsonConvert.DeserializeObject<List<string>>(book.Subjects) ?? new List<string>();
            var bookshelves = JsonConvert.DeserializeObject<List<string>>(book.Bookshelves) ?? new List<string>();

            // Combine subjects and bookshelves
            subjects.AddRange(bookshelves);

            List<string> seedGenres = GetGenresFromEmotions(sentimentData.Emotions, subjects); ///from emotions AND subjects
            List<string> seedArtists = new List<string>();

            if (request.SoundtrackType == "classical")
            {
                seedGenres = new List<string> { "classical" };
            }

            Console.WriteLine($"Seed genres: {string.Join(", ", seedGenres)}");
            Console.WriteLine($"Request info: {JsonConvert.SerializeObject(request)}");

            string usedPreference = "None";

            if (request.UseSpotifyPreferences)
            {
                var (topGenres, topArtists, topTracks) = await _spotifyService.GetTopStats(userId);
                // Use most common genre from top genres
                var mostCommonGenre = topGenres.GroupBy(g => g).OrderByDescending(g => g.Count()).FirstOrDefault()?.Key;
                if (!string.IsNullOrEmpty(mostCommonGenre))
                {
                    seedGenres.Add(mostCommonGenre);
                    Console.WriteLine($"Most common genre: {mostCommonGenre}");
                    usedPreference = mostCommonGenre;
                }

                // Add a random artist to the seeds
                if (topArtists.Any())
                {
                    var randomArtist = topArtists.OrderBy(a => Guid.NewGuid()).FirstOrDefault();
                    if (!string.IsNullOrEmpty(randomArtist))
                    {
                        seedArtists.Add(randomArtist);
                        Console.WriteLine($"Random artist: {randomArtist}");
                        usedPreference += ", " + randomArtist;
                    }
                }
            }

            Console.WriteLine(seedGenres);
            Console.WriteLine(seedArtists);

            List<string> allTrackUris = new List<string>();
            bool timePeriodTooRestrictive = false;

            // normalize VAD values
            double[] normalizedValence = MinMaxNormalize(sentimentData.VAD.windowed_valence.ToArray());
            double[] normalizedArousal = MinMaxNormalize(sentimentData.VAD.windowed_arousal.ToArray());
            double[] normalizedDominance = MinMaxNormalize(sentimentData.VAD.windowed_domninance.ToArray());


            for (int i = 0; i < sentimentData.VAD.windowed_valence.Count; i++)
            {
                double windowValence = normalizedValence[i];
                double windowArousal = i < normalizedArousal.Length ? normalizedArousal[i] : sentimentData.VAD.mean_arousal;
                double windowDominance = i < normalizedDominance.Length ? normalizedDominance[i] : sentimentData.VAD.mean_dominance;


                Console.WriteLine($"Window {i}: Normalized Valence {normalizedValence}, Normalized Arousal {normalizedArousal}, Normalized Dominance {normalizedDominance}");   


                double ratio = sentimentData.VAD.ratio;
                Console.WriteLine($"Window {i}: Valence {windowValence}, Arousal {windowArousal}");
                var recommendations = await _spotifyService.GetRecommendationsForWindow(
                                            userId,
                                            seedGenres,
                                            seedArtists,
                                            ratio,
                                            windowValence,
                                            windowArousal,
                                            windowDominance,
                                            request.PopularityRange?.ToArray()
                                        );
                

                    if (recommendations != null)
                    {
                        Console.WriteLine($"Recommendations for window {i}:");
                        var (filteredRecommendations, wasFiltered) = FilterRecommendationsByDecades(recommendations, request.Decades);
                        allTrackUris.AddRange(filteredRecommendations.Select(track => track["uri"].ToString()).Take(15));
                        timePeriodTooRestrictive = timePeriodTooRestrictive || wasFiltered;
                        Console.WriteLine(string.Join(", ", allTrackUris));
                }
                }
            

            string popularityRangeDescription = request.PopularityRange != null ? string.Join("-", request.PopularityRange) : "Not specified";

            var trackUris = allTrackUris.Distinct().Take(100).ToList();
            Console.WriteLine($"Total tracks: {trackUris.Count}");
            string description = 
                                 $"Emotions: {string.Join(", ", sentimentData.Emotions)}. " +
                                 $"Genres: {string.Join(", ", seedGenres)}. " +
                                 $"VAD: {sentimentData.VAD.mean_valence:F2}, {sentimentData.VAD.mean_arousal:F2}, {sentimentData.VAD.mean_dominance:F2}";
                              

            if(request.UseSpotifyPreferences)
            {
                description += $"Used Spotify preferences: {usedPreference}.";
            }

            if (request.Decades != null && timePeriodTooRestrictive)
            {
                description += "Note: The specified time period was too restrictive, so some tracks may not match the requested decades.";
            }

            var playlistId = await _spotifyService.CreatePlaylist(user.SpotifyId, book.Title, description);
            await _spotifyService.AddTracksToPlaylist(playlistId, trackUris, userId);

            var playlist = new Playlist
            {
                Id = playlistId,
                SpotifyUrl = $"https://open.spotify.com/playlist/{playlistId}",
                Name = book.Title,
                Description = description,
                Book = book,
                User = user
            };

            _context.Playlists.Add(playlist);
            await _context.SaveChangesAsync();

            return playlist;
        }



        private (List<JToken> filteredRecommendations, bool wasFiltered) FilterRecommendationsByDecades(JArray recommendations, List<string> decades)
        {
            if (decades == null || decades.Count == 0)
            {
                return (recommendations.ToList(), false);
            }

            var filteredRecommendations = new List<JToken>();
            var decadeStartYears = decades.Select(d => int.Parse(d.Substring(0, 4))).ToList();

            Console.WriteLine($"Filtering recommendations by decades: {string.Join(", ", decades)}");

            foreach (var track in recommendations)
            {
                var releaseDate = track["album"]["release_date"].ToString();
                var releaseYear = int.Parse(releaseDate.Split('-')[0]);

                if (decadeStartYears.Any(startYear => releaseYear >= startYear && releaseYear < startYear + 10))
                {
                    filteredRecommendations.Add(track);
                }
                else
                {
                    Console.WriteLine($"Track did not pass the filter, it was produced in {releaseYear}");
                }
            }

            bool wasFiltered = filteredRecommendations.Count == 0;
            // Fallback to unfiltered recommendations if the filtered list is empty
            return (wasFiltered ? recommendations.ToList() : filteredRecommendations, wasFiltered);
        }
    }
}
