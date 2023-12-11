using System;
using System.Collections.Generic;
using System.Text;

namespace DitsPortal.Common.Requests
{
   public class BaseRecordFilterRequest
    {
        public int Page { get; set; } = 1;
        public int Limit { get; set; } = 10;
        public string OrderBy { get; set; } = "CreatedOn";
        public bool OrderByDescending { get; set; } = true;
        public bool AllRecords { get; set; } = false;

    }
}
