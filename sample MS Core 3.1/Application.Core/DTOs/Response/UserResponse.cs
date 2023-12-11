using System;
using System.Collections.Generic;
using System.Text;
using TT.Camp.Core.Entities;

namespace TT.Camp.Common.Responses
{
    public class UserResponse: User
    {
        public string token { get; set; }
        public bool Status { get; set; }
        public string Message { get; set; }
    }
}

