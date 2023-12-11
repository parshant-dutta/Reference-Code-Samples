using System;
using System.Collections.Generic;
using System.Text;
using Newtonsoft.Json;

namespace DitsPortal.Common.Responses
{
    public class BaseResponse
    {
        public BaseResponse()
        {
            data = new data();
        }
        public bool Status{ get; set; }
        public string Message { get; set; }
        public data data { get; set; }
    }

    public class data
    {
        public GlobalCodeMainResponse globalCodeMainResponse { get; set; }
        public LeaveMainResponse leaveMainResponse { get; set; }
    }
    public class MainResponse: BaseResponse
    {
        public UserResponse userResponse { get; set; }
        
        public BooleanResponse commonReponse { get; set; }

    }
    public class UserProfileResponse
    {
        public bool Status { get; set; }
        public string Message { get; set; }
        public ProfileResponse userResponse { get; set; }

    }
    public class Response<T>: BaseResponse
    {
        public T Data { get; set; }

    }
    public class MainRoleResponse
    {
        public bool Status { get; set; }
        public string Message { get; set; }
        public RoleResponse roleResponse { get; set; }
        public List<RoleResponse> roleResponseData { get; set; }
        
    }
    public class MainScreenResponse
    {
        public bool Status { get; set; }
        public string Message { get; set; }
        public ScreenResponse screenResponse { get; set; }
        public List<ScreenResponse> screenResponseData { get; set; }
        
    }
    public class MainRolePermissionResponse
    {
        public bool Status { get; set; }
        public string Message { get; set; }
        public RolePermissionResponse rolePermissionResponse { get; set; }
        public List<UserRoles> roleResponseData { get; set; }
    }
    public class MainUserResponse {
        public bool Status { get; set; }
        public string Message { get; set; }
        public List<ProfileResponse> userResponseData { get; set; }
    }
}
