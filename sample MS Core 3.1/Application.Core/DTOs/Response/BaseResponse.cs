using System;
using System.Collections.Generic;
using System.Text;
using TT.Camp.Core.Entities;

namespace TT.Camp.Common.Responses
{
    public class BaseResponse
    {
        public bool Status{ get; set; }
        public string Message { get; set; }
    }

    public class MainResponse: BaseResponse
    {
        public Tenant tenantResponse { get; set; }
        public UserResponse userResponse { get; set; }
        public BooleanResponse commonReponse { get; set; }

    }

    public class Response<T>: BaseResponse
    {
        public T Data { get; set; }

    }
}
