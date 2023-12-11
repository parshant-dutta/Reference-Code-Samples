using System;

namespace TT.Camp.Core.Entities
{
    public class User: BaseEntity
    {
        public int Id { get; set; }
        public string APIKey { get; set; }
        public string Username { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PasswordHash { get; set; }
        public bool IsEmailConfirmed { get; set; } = false;
        public string ResetToken { get; set; }
        public DateTime? ResetTokenExpired { get; set; }
    }

   
}
