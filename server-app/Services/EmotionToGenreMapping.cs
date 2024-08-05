namespace server_app.Services
{
    public static class EmotionToGenreMapper
    {
        private static readonly Dictionary<string, string> EmotionGenreMap = new Dictionary<string, string>
    {
        {"admiration", "classical"},
        {"amusement", "comedy"},
        {"anger", "heavy-metal"},
        {"annoyance", "punk-rock"},
        {"approval", "indie-pop"},
        {"boredom", "ambient"},
        {"calmness", "chill"},
        {"caring", "soft-rock"},
        {"courage", "hard-rock"},
        {"curiosity", "funk"},
        {"desire", "r-n-b"},
        {"despair", "emo"},
        {"disappointment", "acoustic"},
        {"disapproval", "grunge"},
        {"disgust", "death-metal"},
        {"doubt", "trip-hop"},
        {"embarrassment", "indie"},
        {"envy", "hip-hop"},
        {"excitement", "dance"},
        {"faith", "gospel"},
        {"fear", "goth"},
        {"frustration", "hardcore"},
        {"gratitude", "soul"},
        {"greed", "trap"},
        {"grief", "blues"},
        {"guilt", "metalcore"},
        {"indifference", "minimal-techno"},
        {"joy", "dance"},
        {"love", "romance"},
        {"nervousness", "idm"},
        {"nostalgia", "jazz"},
        {"optimism", "happy"},
        {"pain", "metalcore"},
        {"pride", "groove"},
        {"relief", "new-age"},
        {"sadness", "blues"},
        {"surprise", "funk"},
        {"trust", "acoustic"}
    };

        public static string GetGenreForEmotion(string emotion)
        {
            if (EmotionGenreMap.TryGetValue(emotion, out var genre))
            {
                Console.WriteLine(genre);
                return genre;
            }
            Console.WriteLine("am intrat pe classical classical");
            return "classical";
        }
    }

}
