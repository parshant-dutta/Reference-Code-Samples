using System;
using System.Collections.Generic;
using System.Text;

namespace DitsPortal.Common.Responses
{
    public class ProfileResponse
    {
        //public string token { get; set; }
        public int UserId { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public DateTime? DateOfBirth { get; set; }
        public Genders Gender { get; set; }

        public Designations Designation { get; set; }

        public string Phone { get; set; }

        public string AlternateNumber { get; set; }

        public string OfficialEmail { get; set; }

        public string Skype { get; set; }

        public string PAN { get; set; }
        public BloodGroups BloodGroup { get; set; }
        public DateTime? dateofjoining { get; set; }
        public DateTime? DateOfLeaving { get; set; }
        public int? MediaId { get; set; }
        public DateTime? LastLoggedIn { get; set; }

    }
    public class Genders
    {
        public int Id { get; set; }
        public string GenderName { get; set; }
    }
    public class Designations
    {
        public int? Id { get; set; }
        public string DesignationName { get; set; }
    }
    public class BloodGroups
    {
        public int? Id { get; set; }
        public string BloodGroupName { get; set; }
    }

    
}
