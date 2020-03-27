using System;
using System.Collections.Generic;
using System.Text;

namespace DitsPortal.Common.Requests
{
    public class BaseRequest
    {
        public string UserName { get; set; }
    }

    public class CommonRequest : BaseRequest
    {
        public int UserId { get; set; }
    }

}
