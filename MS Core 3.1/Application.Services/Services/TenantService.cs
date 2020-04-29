using AutoMapper;
using System;
using System.Threading.Tasks;
using TT.Camp.Core.Entities;
using TT.Camp.Data.Repository.IRepository;
using TT.Camp.Services.IServices;

namespace TT.Camp.Services.Services
{
    public class TenantService : ITenantService
    {
        #region readonly
        private readonly ITenantRepository _tenantRepository;
        private readonly IMapper _mapper;
        #endregion

      

        public TenantService(ITenantRepository tenantRepository, IMapper mapper)
        {
            _tenantRepository = tenantRepository;
            _mapper = mapper;

        }


        public async Task<Tenant> GetCurrentTenant(string host)
        {
            try
            {
                object tenantDetails = await _tenantRepository.getTenantDetails(host);

                if (tenantDetails != null)
                {
                    var response = _mapper.Map<Tenant>(tenantDetails);
                    return response;
                }
            }
            catch (Exception ex)
            {

            }

            return null;
        }
    }
}
