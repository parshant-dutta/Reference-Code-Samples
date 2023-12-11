using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using AutoMapper;
using DitsPortal.Common.Requests;
using DitsPortal.Common.Responses;
using DitsPortal.Common.StaticResources;
using DitsPortal.DataAccess;
using DitsPortal.DataAccess.IRepositories;
using DitsPortal.Services.IServices;
using Microsoft.Extensions.Logging;

namespace DitsPortal.Services.Services
{
    public class GlobalCodesService : IGlobalCodesService
    {
        #region readonly
        private readonly IGlobalCodesRepository _globalCodesIRepository;
        private readonly IMapper _mapper;
        #endregion

        #region Object Variables
        private MainResponse _response;
        private UploadImage _uploadImage;
        private BaseResponse _baseResponse;
        private ILogger<GlobalCodesService> _logger;
        #endregion

        public GlobalCodesService(IGlobalCodesRepository globalCodesIRepository, IMapper mapper, ILogger<GlobalCodesService> logger)
        {
            _globalCodesIRepository = globalCodesIRepository;
            _mapper = mapper;
            _logger = logger;
            _response = new MainResponse();
            _uploadImage = new UploadImage();
            _response.Status = false;
        }
        public async Task<BaseResponse> GetAllGlobalCodeRecords(LeaveRequest leaveRequest)
        {
            try
            {
                var globalCodeResponse = await _globalCodesIRepository.GetAllGlobalCodeRecords(leaveRequest);
                if (globalCodeResponse.totalRecords != 0)
                {

                    _response.Status = true;
                    _response.Message = Constants.DEFAULT_SUCCESS_MSG;
                    _response.data.globalCodeMainResponse = globalCodeResponse;
                }
                else
                {
                    _response.Message = Constants.GLOBAL_CODE_CATEGORY_NOT_EXISTS;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
                _response.Status = false;
                _response.Message = Constants.DEFAULT_ERROR_MSG;
            }
            return _response;
        }

        public async Task<BaseResponse> GetGlobalCodeByCategoryName(GlobalCodeCategoryRequest globalCodeCategoryRequest)
        {
            try
            {
                var globalCodeResponse = await _globalCodesIRepository.GetGlobalCodeByCategoryName(globalCodeCategoryRequest);
                if (globalCodeResponse.totalRecords != 0)
                {
                    _response.Status = true;
                    _response.Message = Constants.DEFAULT_SUCCESS_MSG;
                    _response.data.globalCodeMainResponse = globalCodeResponse;
                }
                else
                {
                    _response.Message = Constants.GLOBAL_CODE_CATEGORY_NOT_EXISTS;
                }
            }
            catch (Exception ex) 
            {
                _logger.LogError(ex, ex.Message);
                _response.Status = false;
                _response.Message = Constants.DEFAULT_ERROR_MSG;
            }

            return _response;
        }
    }
}

