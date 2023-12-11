using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using TT.Camp.Common.Responses;
using TT.Camp.Common.StaticResources;
using TT.Camp.Services.IServices;

namespace TT.Camp.Web.API.Controllers.Base
{
    public abstract class BaseTenantResolverController : Controller
    {
        #region readonly
        public readonly string _host;

        public readonly IHttpContextAccessor _httpContextAccessor;
        public readonly ITenantService _tenantService;
        #endregion

        #region public
        public string _json = string.Empty;
        public MainResponse _response;
        #endregion


        public BaseTenantResolverController(IHttpContextAccessor httpContextAccessor, ITenantService tenantService)
        {
            _httpContextAccessor = httpContextAccessor;
            _tenantService = tenantService;

            _response = new MainResponse();
            _host = httpContextAccessor.HttpContext.Request.Host.Port.ToString();

        }

        [NonAction]
        public async Task<MainResponse> CheckTenantDetails()
        {
            var tenantDetails = await _tenantService.GetCurrentTenant(_host);
            
            if (tenantDetails == null)
            {
                _response.Status = false;
                _response.Message = Constants.TENANT_ERROR;
            }
            else
            {
                _response.Status = true;
            }

            _response.tenantResponse = tenantDetails;

            return _response;
        }
    }
}