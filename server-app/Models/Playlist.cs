using System.Diagnostics.Eventing.Reader;

namespace server_app.Models
{
    public class Playlist
    {
        public string Id { get; set; }
        public string SpotifyUrl { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public int BookId { get; set; }
        public virtual Book Book { get; set; }

        public string UserId { get; set; }
        public virtual User User { get; set; }
    }
}
