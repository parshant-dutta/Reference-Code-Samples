using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text;
using DitsPortal.Common.StaticResources;

namespace DitsPortal.Common.Requests
{
    public class GlobalCodeRequest : BaseRequest
    {
        [Required]
        public int GlobalCodeCategoryId { get; set; }
        //[Required]
        //public string CodeName { get; set; }
        //public string Description { get; set; }
        //public bool IsActive { get; set; }
    }
    public class GlobalCodeCategoryRequest
    {
        [Required]
        public String Name { get; set; }
       
    }
    public class GlobalCodeUpdateRequest : BaseRequest
    {
        [Required]
        public int GlobalCodeId { get; set; }

        [Required]
        public int CategoryId { get; set; }


        [Required]
        public string CodeName { get; set; }
        public string Description { get; set; }
        public string Active { get; set; }


    }

    public class GlobalCodeDeleteRequest : BaseRequest
    {
        [Required]
        public int GlobalCodeId { get; set; }
    }

    public class GlobalCodeUpdateActiveStatusRequest : BaseRequest
    {
        [Required]
        public int GlobalCodeId { get; set; }

        [Required]
        public string Active { get; set; }

    }

    public class GetGlobalCodeRequest : BaseRequest
    {
        public int? CategoryId { get; set; }
        //public string CategoryName { get; set; }
    }


}
