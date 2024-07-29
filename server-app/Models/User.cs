using System.ComponentModel.DataAnnotations;

namespace server_app.Models
{
    public class User
    {
        [Key]
        public string Id { get; set; }
        public string SpotifyId { get; set; }
        public string Email { get; set; }
        public string DisplayName { get; set; }

        public string AccessToken { get; set; }
        public string RefreshToken { get; set; }
        public DateTime AccessTokenExpiry { get; set; }

        public virtual List<Playlist> Playlists { get; set; }

        public ICollection<UserBook> FavoriteBooks { get; set; } = new List<UserBook>();

    }
}
