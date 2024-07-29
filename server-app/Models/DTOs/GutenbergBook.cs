namespace server_app.Models.DTOs
{
    public class GutenbergBook
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public List<AuthorGutenberg> Authors { get; set; } = new List<AuthorGutenberg>();
        public Dictionary<string, string> Formats { get; set;}

        public List<string> Subjects { get; set; } = new List<string>(); // Assuming array of strings in JSON
        public List<string> Bookshelves { get; set; } = new List<string>(); // Assuming array of strings in JSON
    }

    public class AuthorGutenberg
    {
        public string Name { get; set; }
    }
}

