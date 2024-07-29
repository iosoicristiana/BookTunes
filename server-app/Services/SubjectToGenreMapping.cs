using System.Drawing.Printing;
using System.Text.RegularExpressions;

namespace server_app.Services
{
    public class SubjectToGenreMapper
    {

        private static readonly Dictionary<string, List<string>> SubjectGenreMap = new Dictionary<string, List<string>>()
        {
            { "Gothic", new List<string> {"goth", "grunge"} },
            { "Fantasy", new List<string> { "symphonic metal", "folk" } },
            { "Science", new List<string> { "synthwave", "industrial" } },
            { "Mystery", new List<string> { "jazz", "blues" } },
            { "Horror", new List<string> { "goth", "grunge" } },
            { "Romance", new List<string> { "romance", "r&b" } },
            { "Historical", new List<string> { "classical", "opera" } },
            { "Non-Fiction", new List<string> { "ambient", "chill" } },
            { "Biography", new List<string> { "ambient", "chill" } },
            { "Tragedy", new List<string> { "psych-rock", "new-age" } },
            { "Adventure", new List<string> { "rock-n-roll", "folk" } }
        };

        public static List<string> GetGenresForSubject(string subject)
        {
            subject = Regex.Replace(subject, " -- Fiction", "", RegexOptions.IgnoreCase);
            foreach (var entry in SubjectGenreMap)
            {

                //check if the subject is contained in the dictionary as the key, ignore case sensitivity or if there are other words 
                {
                    if (subject.IndexOf(entry.Key, StringComparison.OrdinalIgnoreCase) >= 0)
                    {
                        Console.WriteLine($"Matched {entry.Key} to genres: {string.Join(", ", entry.Value)}");

                        return entry.Value;
                    }

                }
            }
            //return empty list if no match is found
            return new List<string>();
        }
    }
}
