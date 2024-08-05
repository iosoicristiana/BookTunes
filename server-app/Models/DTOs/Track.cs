namespace server_app.Models.DTOs
{
    public class Track
    {
        public string Id { get; set; }
        public string Name { get; set; }
        public string Artists { get; set; }
        public string Album { get; set; }
        public int Duration { get; set; } // Duration in milliseconds
        public string SpotifyUrl { get; set; }

    }
}
