using AutoMapper;
using TT.Camp.Common.Requests;
using TT.Camp.Common.Responses;
using TT.Camp.Core.Entities;

namespace TT.Camp.AutoMapper.Mappings
{
    public class AutoMapping: Profile
    {
        public AutoMapping()
        {
            // Request Mapping
            CreateMap<UserRegisterRequest, User>();
            CreateMap<ForgotPasswordRequest, User>();
            // Response Mapping
            CreateMap<User, UserResponse>();

        }
    }
}
