using Newtonsoft.Json;
using server_app.Models.DTOs;

namespace server_app.Models
{
    public class Book
    {
        public int Id { get; set; }
        public int GutenbergId { get; set; }
        public string Title { get; set; }
        public string Author { get; set; }
        public string Formats { get; set; }

        public string Subjects { get; set;}

        public string Bookshelves { get; set; }

        public string SentimentData { get; set; }   

        public Dictionary <string, string> GetFormatsDictionary()
        {
            return string.IsNullOrEmpty(Formats) ? new Dictionary<string, string>() : JsonConvert.DeserializeObject<Dictionary<string, string>>(Formats);
        }
        public void SetFormatsDictionary(Dictionary<string, string> formats)
        {
            Formats = JsonConvert.SerializeObject(formats);
        }
       


        public virtual List<Playlist> Playlists { get; set; }
        public ICollection<UserBook> UserFavorites { get; set; } = new List<UserBook>();
    }
}
