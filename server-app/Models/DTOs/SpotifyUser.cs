using Newtonsoft.Json;

public class SpotifyUser
{
    [JsonProperty("id")]
    public string Id { get; set; }  // Spotify user ID

    [JsonProperty("email")]
    public string Email { get; set; }  // User's email address

    [JsonProperty("display_name")]
    public string DisplayName { get; set; }  // User's display name

    [JsonProperty("followers")]
    public Followers Followers { get; set; }  // User's followers

    [JsonProperty("images")]
    public List<SpotifyImage> Images { get; set; }

}

public class Followers
{
    [JsonProperty("href")]
    public string Href { get; set; }  // Link to the followers list

    [JsonProperty("total")]
    public int Total { get; set; }
}

public class SpotifyImage
{
    [JsonProperty("url")]
    public string Url { get; set; }

    [JsonProperty("height")]
    public int Height { get; set; }

    [JsonProperty("width")]
    public int Width { get; set; }
}

/*
 *   "images": [
    {
      "url": "https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228",
      "height": 300,
      "width": 300
    }
*/