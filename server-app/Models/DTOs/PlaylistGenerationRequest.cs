using System.ComponentModel.DataAnnotations;

namespace server_app.Models.DTOs
{
    public class PlaylistGenerationRequest
    {
        public int BookId { get; set; }

        public string SoundtrackType { get; set; } = "classical";

        public bool UseSpotifyPreferences { get; set; } = false;

        public List<int> PopularityRange { get; set; } = new List<int> { 0, 100 };

        public List<string> Decades { get; set; } = new List<string>();
    }

}
