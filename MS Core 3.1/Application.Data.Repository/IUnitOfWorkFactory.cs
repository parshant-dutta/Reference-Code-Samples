using System;
using System.Collections.Generic;
using System.Text;

namespace TT.Camp.Data.Repository
{
    public interface IUnitOfWorkFactory
    {
        UnitOfWork Create();
    }
}
