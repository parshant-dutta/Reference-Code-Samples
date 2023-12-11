using System;
using System.Collections.Generic;
using System.Text;

namespace TT.Camp.Data.Repository
{
    public interface IDbContext
    {
        //IProductRepository Product { get; set; }

        void Begin();
        void Commit();
        void Rollback();
    }
}
