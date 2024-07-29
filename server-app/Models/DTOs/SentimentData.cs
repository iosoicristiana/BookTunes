namespace server_app.Models.DTOs
{
    public class SentimentData
    {
        public List<string> Emotions { get; set; }
        public VADData VAD { get; set; }
    }

    public class VADData
    {
        public double ratio { get; set; }
        public double mean_arousal { get; set; }
        public double mean_dominance { get; set; }
        public double mean_valence { get; set; }

        public List<double> windowed_arousal { get; set; }
        public List<double> windowed_valence { get; set; }
        public List<double> windowed_domninance { get; set; }
    }

}
