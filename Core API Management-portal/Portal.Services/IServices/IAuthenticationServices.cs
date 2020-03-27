using DitsPortal.Common.Requests;
using DitsPortal.Common.Responses;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
//using static DitsPortal.Common.Requests.UserRequest;
using static DitsPortal.Common.Responses.UserResponse;

namespace DitsPortal.Services.IRepositories
{
   public  interface IAuthenticationServices
   {
        MainResponse RegisterUser(UserRegisterRequest register);
    }
}
